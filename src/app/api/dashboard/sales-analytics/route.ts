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
    const period = searchParams.get("period") || "6months"; // 6months, 1year, 3months

    // Calculate date range
    const now = new Date();
    let startDate: Date;
    let monthsBack: number;

    switch (period) {
      case "3months":
        monthsBack = 3;
        break;
      case "1year":
        monthsBack = 12;
        break;
      default:
        monthsBack = 6;
    }

    startDate = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);

    // Get sales data grouped by month
    const salesByMonth = await prisma.sale.groupBy({
      by: ["date"],
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      _sum: {
        amount: true,
      },
      _count: {
        id: true,
      },
    });

    // Get customer registrations by month
    const customersByMonth = await prisma.customer.groupBy({
      by: ["createdAt"],
      where: {
        userId: user.id,
        createdAt: { gte: startDate },
      },
      _count: {
        id: true,
      },
    });

    // Create monthly aggregates
    const monthlyData: Record<
      string,
      {
        month: string;
        sales: number;
        revenue: number;
        customers: number;
      }
    > = {};

    // Initialize all months with zero values
    for (let i = 0; i < monthsBack; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthKey = date.toLocaleString("default", { month: "short" });
      monthlyData[monthKey] = {
        month: monthKey,
        sales: 0,
        revenue: 0,
        customers: 0,
      };
    }

    // Aggregate sales data
    salesByMonth.forEach((sale) => {
      const monthKey = new Date(sale.date).toLocaleString("default", {
        month: "short",
      });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].sales += sale._count.id;
        monthlyData[monthKey].revenue += sale._sum.amount || 0;
      }
    });

    // Aggregate customer data
    customersByMonth.forEach((customer) => {
      const monthKey = new Date(customer.createdAt).toLocaleString("default", {
        month: "short",
      });
      if (monthlyData[monthKey]) {
        monthlyData[monthKey].customers += customer._count.id;
      }
    });

    // Convert to array and sort by month order
    const salesData = Object.values(monthlyData)
      .reverse() // Reverse to get chronological order
      .map((data) => ({
        month: data.month,
        sales: Math.round(data.sales),
        revenue: Math.round(data.revenue),
        customers: data.customers,
      }));

    return NextResponse.json({
      success: true,
      data: salesData,
      period,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Sales analytics error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
