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

    if (type === "inventory") {
      // Get inventory categories
      const inventoryByCategory = await prisma.inventory.groupBy({
        by: ["category"],
        where: {
          userId: user.id,
          category: { not: null },
        },
        _count: {
          id: true,
        },
        _sum: {
          quantity: true,
          price: true,
        },
      });

      categoryData = inventoryByCategory
        .filter((item) => item.category) // Remove null categories
        .map((item, index) => ({
          name: item.category || "Uncategorized",
          value: item._sum.quantity || 0,
          count: item._count.id,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value) // Sort by quantity descending
        .slice(0, 8); // Limit to top 8 categories
    } else if (type === "sales") {
      // Get sales by inventory category
      const salesByCategory = await prisma.sale.findMany({
        where: {
          userId: user.id,
        },
        include: {
          item: {
            select: {
              category: true,
            },
          },
        },
      });

      // Aggregate by category
      const categoryTotals: Record<string, { count: number; amount: number }> =
        {};

      salesByCategory.forEach((sale) => {
        const category = sale.item.category || "Uncategorized";
        if (!categoryTotals[category]) {
          categoryTotals[category] = { count: 0, amount: 0 };
        }
        categoryTotals[category].count += 1;
        categoryTotals[category].amount += sale.amount;
      });

      categoryData = Object.entries(categoryTotals)
        .map(([name, data], index) => ({
          name,
          value: data.count,
          count: data.count,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    } else if (type === "revenue") {
      // Get revenue by inventory category
      const salesByCategory = await prisma.sale.findMany({
        where: {
          userId: user.id,
        },
        include: {
          item: {
            select: {
              category: true,
            },
          },
        },
      });

      // Aggregate revenue by category
      const categoryRevenue: Record<
        string,
        { count: number; revenue: number }
      > = {};

      salesByCategory.forEach((sale) => {
        const category = sale.item.category || "Uncategorized";
        if (!categoryRevenue[category]) {
          categoryRevenue[category] = { count: 0, revenue: 0 };
        }
        categoryRevenue[category].count += 1;
        categoryRevenue[category].revenue += sale.amount;
      });

      categoryData = Object.entries(categoryRevenue)
        .map(([name, data], index) => ({
          name,
          value: Math.round(data.revenue),
          count: data.count,
          color: colors[index % colors.length],
        }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);
    }

    // If no categories found, provide default data
    if (categoryData.length === 0) {
      categoryData = [{ name: "No Data", value: 0, color: colors[0] }];
    }

    // Calculate total for percentage calculations
    const total = categoryData.reduce((sum, item) => sum + item.value, 0);

    // Add percentage information
    const dataWithPercentages = categoryData.map((item) => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0,
    }));

    return NextResponse.json({
      success: true,
      data: dataWithPercentages,
      type,
      summary: {
        totalCategories: categoryData.length,
        totalValue: total,
        topCategory: categoryData[0]?.name || "None",
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Categories error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
