import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "6months";

    // Calculate date range based on period
    const endDate = new Date();
    let startDate = new Date();

    switch (period) {
      case "3months":
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case "6months":
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case "1year":
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 6);
    }

    // Get sales data grouped by month
    const salesData = await prisma.sale.groupBy({
      by: ["date"],
      where: {
        userId: user.id,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get customer counts for each month
    const customerData = await prisma.customer.groupBy({
      by: ["createdAt"],
      where: {
        userId: user.id,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      _count: {
        id: true,
      },
    });

    // Format data for the chart
    const formattedData = salesData.map((sale) => ({
      month: sale.date.toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      }),
      sales: sale._count.id,
      revenue: sale._sum.amount || 0,
      customers:
        customerData.find(
          (c) =>
            c.createdAt.getMonth() === sale.date.getMonth() &&
            c.createdAt.getFullYear() === sale.date.getFullYear()
        )?._count.id || 0,
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("[SALES_ANALYTICS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
