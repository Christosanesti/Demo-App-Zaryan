import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user exists in database
    const dbUser = await prisma.user.upsert({
      where: { id: user.id },
      update: {},
      create: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    });

    // Get sales data for the current month
    const currentDate = new Date();
    const startOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      1
    );
    const endOfMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() + 1,
      0
    );

    const [sales, customers, inventory] = await Promise.all([
      // Get total sales for the month
      prisma.sale.aggregate({
        where: {
          userId: user.id,
          date: {
            gte: startOfMonth,
            lte: endOfMonth,
          },
        },
        _sum: {
          amount: true,
        },
      }),
      // Get total customers
      prisma.customer.count({
        where: {
          userId: user.id,
        },
      }),
      // Get total inventory items
      prisma.inventory.aggregate({
        where: {
          userId: user.id,
        },
        _sum: {
          quantity: true,
        },
      }),
    ]);

    // Calculate previous month's data for comparison
    const startOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - 1,
      1
    );
    const endOfPrevMonth = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth(),
      0
    );

    const prevMonthSales = await prisma.sale.aggregate({
      where: {
        userId: user.id,
        date: {
          gte: startOfPrevMonth,
          lte: endOfPrevMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Calculate growth percentages
    const currentSales = sales._sum.amount || 0;
    const prevSales = prevMonthSales._sum.amount || 0;
    const salesGrowth =
      prevSales === 0 ? 100 : ((currentSales - prevSales) / prevSales) * 100;

    // Construct response
    const dashboardData = [
      {
        metric: "Revenue",
        current: currentSales,
        target: currentSales * 1.2, // 20% higher than current
        percentage: Math.min(100, (currentSales / (currentSales * 1.2)) * 100),
        growth: salesGrowth,
        trend: salesGrowth >= 0 ? "up" : "down",
      },
      {
        metric: "Sales",
        current: currentSales,
        target: currentSales * 1.2,
        percentage: Math.min(100, (currentSales / (currentSales * 1.2)) * 100),
        growth: salesGrowth,
        trend: salesGrowth >= 0 ? "up" : "down",
      },
      {
        metric: "Customers",
        current: customers,
        target: customers * 1.2,
        percentage: Math.min(100, (customers / (customers * 1.2)) * 100),
        growth: 0, // No historical data for comparison
        trend: "up",
      },
      {
        metric: "Inventory",
        current: inventory._sum.quantity || 0,
        target: (inventory._sum.quantity || 0) * 1.2,
        percentage: Math.min(
          100,
          ((inventory._sum.quantity || 0) /
            ((inventory._sum.quantity || 0) * 1.2)) *
            100
        ),
        growth: 0, // No historical data for comparison
        trend: "up",
      },
    ];

    return NextResponse.json({ data: dashboardData });
  } catch (error) {
    console.error("[DASHBOARD_OVERVIEW]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
