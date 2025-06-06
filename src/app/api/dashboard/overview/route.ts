import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const overviewSchema = z.object({
  from: z.string().optional(),
  to: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const validatedData = overviewSchema.parse({
      from: from || undefined,
      to: to || undefined,
    });

    // Get sales data
    const sales = await prisma.sale.aggregate({
      where: {
        userId: user.id,
        ...(validatedData.from && validatedData.to ?
          {
            date: {
              gte: new Date(validatedData.from),
              lte: new Date(validatedData.to),
            },
          }
        : {}),
      },
      _sum: {
        amount: true,
      },
      _count: true,
    });

    // Get customer data
    const customers = await prisma.customer.count({
      where: {
        userId: user.id,
        ...(validatedData.from && validatedData.to ?
          {
            createdAt: {
              gte: new Date(validatedData.from),
              lte: new Date(validatedData.to),
            },
          }
        : {}),
      },
    });

    // Get inventory data
    const inventory = await prisma.inventory.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        quantity: true,
      },
      _count: true,
    });

    // Calculate growth percentages
    const previousPeriodSales = await prisma.sale.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: new Date(
            new Date(validatedData.from || new Date()).getTime() -
              30 * 24 * 60 * 60 * 1000
          ),
          lt: new Date(validatedData.from || new Date()),
        },
      },
      _sum: {
        amount: true,
      },
    });

    const salesGrowth =
      previousPeriodSales._sum.amount ?
        ((sales._sum.amount || 0) - previousPeriodSales._sum.amount) /
        previousPeriodSales._sum.amount
      : 0;

    return NextResponse.json({
      data: [
        {
          metric: "Sales",
          current: sales._sum.amount || 0,
          target: 10000, // You might want to make this configurable
          percentage: Math.min(((sales._sum.amount || 0) / 10000) * 100, 100),
          growth: Math.round(salesGrowth * 100),
          trend: salesGrowth >= 0 ? "up" : "down",
        },
        {
          metric: "Revenue",
          current: sales._sum.amount || 0,
          target: 50000, // You might want to make this configurable
          percentage: Math.min(((sales._sum.amount || 0) / 50000) * 100, 100),
          growth: Math.round(salesGrowth * 100),
          trend: salesGrowth >= 0 ? "up" : "down",
        },
        {
          metric: "Customers",
          current: customers,
          target: 100, // You might want to make this configurable
          percentage: Math.min((customers / 100) * 100, 100),
          growth: 0, // You might want to calculate this based on previous period
          trend: "up",
        },
        {
          metric: "Inventory",
          current: inventory._count || 0,
          target: 200, // You might want to make this configurable
          percentage: Math.min(((inventory._count || 0) / 200) * 100, 100),
          growth: 0, // You might want to calculate this based on previous period
          trend: "up",
        },
      ],
    });
  } catch (error) {
    console.error("[OVERVIEW_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
