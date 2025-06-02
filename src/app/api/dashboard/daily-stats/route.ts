import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get data for the last 7 days
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);

    // Get sales data grouped by day
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

    // Format data for the chart
    const formattedData = salesData.map((sale) => ({
      day: sale.date.toLocaleDateString("en-US", { weekday: "short" }),
      orders: sale._count.id,
      revenue: sale._sum.amount || 0,
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("[DAILY_STATS]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
