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
    const type = searchParams.get("type") || "inventory"; // inventory, sales, revenue

    let categoryData: Array<{
      name: string;
      value: number;
      color: string;
      count?: number;
      percentage: number;
    }> = [];

    // Color palette for categories
    const colors = [
      "#8884d8", // Purple
      "#82ca9d", // Green
      "#ffc658", // Yellow
      "#ff7c7c", // Red
      "#8dd1e1", // Cyan
      "#d084d0", // Pink
      "#87d068", // Light Green
      "#ffb347", // Orange
    ];

    switch (type) {
      case "inventory":
        // Get inventory items grouped by category
        const inventoryData = await prisma.inventory.groupBy({
          by: ["category"],
          where: {
            userId: user.id,
          },
          _sum: {
            quantity: true,
          },
          _count: {
            id: true,
          },
        });

        categoryData = inventoryData.map((item) => ({
          name: item.category || "Uncategorized",
          value: item._sum.quantity || 0,
          color: colors[Math.floor(Math.random() * colors.length)],
          percentage: 0, // Will be calculated after
          count: item._count.id,
        }));
        break;

      case "sales":
        // Get sales data grouped by category
        const salesData = await prisma.sale.groupBy({
          by: ["itemId"],
          where: {
            userId: user.id,
          },
          _sum: {
            amount: true,
          },
          _count: {
            id: true,
          },
        });

        // Get item details for each sale
        const items = await prisma.inventory.findMany({
          where: {
            id: {
              in: salesData.map((sale) => sale.itemId),
            },
          },
          select: {
            id: true,
            category: true,
          },
        });

        categoryData = salesData.map((sale) => {
          const item = items.find((i) => i.id === sale.itemId);
          return {
            name: item?.category || "Uncategorized",
            value: sale._sum.amount || 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            percentage: 0, // Will be calculated after
            count: sale._count.id,
          };
        });
        break;

      case "revenue":
        // Get revenue data grouped by category
        const revenueData = await prisma.sale.groupBy({
          by: ["itemId"],
          where: {
            userId: user.id,
          },
          _sum: {
            amount: true,
          },
        });

        // Get item details for each sale
        const revenueItems = await prisma.inventory.findMany({
          where: {
            id: {
              in: revenueData.map((sale) => sale.itemId),
            },
          },
          select: {
            id: true,
            category: true,
          },
        });

        categoryData = revenueData.map((sale) => {
          const item = revenueItems.find((i) => i.id === sale.itemId);
          return {
            name: item?.category || "Uncategorized",
            value: sale._sum.amount || 0,
            color: colors[Math.floor(Math.random() * colors.length)],
            percentage: 0, // Will be calculated after
          };
        });
        break;

      default:
        return NextResponse.json(
          { error: "Invalid type parameter" },
          { status: 400 }
        );
    }

    // Calculate percentages
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);
    categoryData = categoryData.map((item) => ({
      ...item,
      percentage: total === 0 ? 0 : Math.round((item.value / total) * 100),
    }));

    return NextResponse.json({
      success: true,
      data: categoryData,
      type,
      summary: {
        totalCategories: categoryData.length,
        totalValue: total,
        topCategory: categoryData[0]?.name || "None",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CATEGORIES]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to generate random colors for the pie chart
function getRandomColor() {
  const colors = [
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#06b6d4", // cyan
    "#f97316", // orange
    "#84cc16", // lime
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}
