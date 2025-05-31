import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get current month for comparison
    const now = new Date();
    const currentMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Calculate revenue from sales and ledger entries
    const [
      currentMonthSales,
      previousMonthSales,
      totalCustomers,
      previousMonthCustomers,
      totalInventoryItems,
      currentMonthOrders,
      previousMonthOrders,
      revenueFromSales,
    ] = await Promise.all([
      // Current month sales
      prisma.sale.aggregate({
        where: {
          userId: user.id,
          createdAt: { gte: currentMonth },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Previous month sales for comparison
      prisma.sale.aggregate({
        where: {
          userId: user.id,
          createdAt: {
            gte: previousMonth,
            lt: currentMonth,
          },
        },
        _sum: { amount: true },
        _count: true,
      }),

      // Total customers
      prisma.customer.count({
        where: { userId: user.id },
      }),

      // Previous month customers
      prisma.customer.count({
        where: {
          userId: user.id,
          createdAt: { lt: currentMonth },
        },
      }),

      // Total inventory items
      prisma.inventory.count({
        where: { userId: user.id },
      }),

      // Current month orders (sales count)
      prisma.sale.count({
        where: {
          userId: user.id,
          createdAt: { gte: currentMonth },
        },
      }),

      // Previous month orders
      prisma.sale.count({
        where: {
          userId: user.id,
          createdAt: {
            gte: previousMonth,
            lt: currentMonth,
          },
        },
      }),

      // Revenue from direct sales
      prisma.sale.aggregate({
        where: { userId: user.id },
        _sum: { amount: true },
      }),
    ]);

    // Calculate totals and percentages
    const totalRevenue = revenueFromSales._sum.amount || 0;
    const currentRevenue = currentMonthSales._sum.amount || 0;
    const previousRevenue = previousMonthSales._sum.amount || 0;

    const revenueTarget = 50000; // This could be configurable in user settings
    const ordersTarget = 1500;
    const customersTarget = 1000;
    const productsTarget = 200;

    // Calculate growth percentages
    const revenueGrowth =
      previousRevenue > 0 ?
        ((currentRevenue - previousRevenue) / previousRevenue) * 100
      : 0;

    const ordersGrowth =
      previousMonthOrders > 0 ?
        ((currentMonthOrders - previousMonthOrders) / previousMonthOrders) * 100
      : 0;

    const customersGrowth =
      previousMonthCustomers > 0 ?
        ((totalCustomers - previousMonthCustomers) / previousMonthCustomers) *
        100
      : 0;

    const performanceData = [
      {
        metric: "Revenue",
        current: Math.round(totalRevenue),
        target: revenueTarget,
        percentage: Math.round((totalRevenue / revenueTarget) * 100),
        growth: Math.round(revenueGrowth * 10) / 10,
        trend: revenueGrowth >= 0 ? "up" : "down",
      },
      {
        metric: "Orders",
        current: currentMonthOrders,
        target: ordersTarget,
        percentage: Math.round((currentMonthOrders / ordersTarget) * 100),
        growth: Math.round(ordersGrowth * 10) / 10,
        trend: ordersGrowth >= 0 ? "up" : "down",
      },
      {
        metric: "Customers",
        current: totalCustomers,
        target: customersTarget,
        percentage: Math.round((totalCustomers / customersTarget) * 100),
        growth: Math.round(customersGrowth * 10) / 10,
        trend: customersGrowth >= 0 ? "up" : "down",
      },
      {
        metric: "Products",
        current: totalInventoryItems,
        target: productsTarget,
        percentage: Math.round((totalInventoryItems / productsTarget) * 100),
        growth: 0, // Products don't have growth comparison
        trend: "stable",
      },
    ];

    return NextResponse.json({
      success: true,
      data: performanceData,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Dashboard overview error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
