import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get the last 7 days
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Get sales data for the last 7 days
    const dailySales = await prisma.sale.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        amount: true,
        createdAt: true,
      },
    });

    // Initialize daily data structure
    const dailyData: Record<
      string,
      {
        day: string;
        orders: number;
        revenue: number;
      }
    > = {};

    // Get day names for the last 7 days
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayKey = dayNames[date.getDay()];
      const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format

      dailyData[dateKey] = {
        day: dayKey,
        orders: 0,
        revenue: 0,
      };
    }

    // Aggregate sales data
    dailySales.forEach((sale) => {
      const dateKey = sale.createdAt.toISOString().split("T")[0];
      if (dailyData[dateKey]) {
        dailyData[dateKey].orders += 1;
        dailyData[dateKey].revenue += sale.amount;
      }
    });

    // Convert to array and format
    const dailyStats = Object.values(dailyData).map((data) => ({
      day: data.day,
      orders: data.orders,
      revenue: Math.round(data.revenue),
    }));

    // Calculate weekly summary
    const weeklyTotals = dailyStats.reduce(
      (acc, day) => ({
        totalOrders: acc.totalOrders + day.orders,
        totalRevenue: acc.totalRevenue + day.revenue,
      }),
      { totalOrders: 0, totalRevenue: 0 }
    );

    const avgDailyOrders = Math.round(weeklyTotals.totalOrders / 7);
    const avgDailyRevenue = Math.round(weeklyTotals.totalRevenue / 7);

    return NextResponse.json({
      success: true,
      data: dailyStats,
      summary: {
        totalOrders: weeklyTotals.totalOrders,
        totalRevenue: weeklyTotals.totalRevenue,
        avgDailyOrders,
        avgDailyRevenue,
        period: "Last 7 days",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Daily stats error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
