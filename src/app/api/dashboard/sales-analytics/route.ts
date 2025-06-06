import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const salesAnalyticsSchema = z.object({
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

    const validatedData = salesAnalyticsSchema.parse({
      from: from || undefined,
      to: to || undefined,
    });

    // Get sales data grouped by date
    const salesData = await prisma.sale.groupBy({
      by: ["date"],
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
        totalAmount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get customer data for the same period
    const customerData = await prisma.customer.groupBy({
      by: ["createdAt"],
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
      _count: {
        id: true,
      },
    });

    // Format the data for the chart
    const formattedData = salesData.map((sale) => ({
      date: sale.date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      sales: sale._count.id,
      revenue: sale._sum.totalAmount || 0,
      customers:
        customerData.find(
          (c) =>
            c.createdAt.toLocaleDateString() === sale.date.toLocaleDateString()
        )?._count.id || 0,
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("[SALES_ANALYTICS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
