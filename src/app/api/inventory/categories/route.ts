import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

// GET /api/inventory/categories
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get unique categories from inventory
    const categories = await prisma.inventory.findMany({
      where: {
        userId: user.id,
        category: {
          not: null,
        },
      },
      select: {
        category: true,
      },
      distinct: ["category"],
    });

    // Get category statistics
    const categoryStats = await prisma.inventory.groupBy({
      by: ["category"],
      where: {
        userId: user.id,
      },
      _count: {
        id: true,
      },
      _sum: {
        quantity: true,
      },
      _avg: {
        price: true,
        costPrice: true,
      },
    });

    // Combine categories with stats
    const categoriesWithStats = categoryStats.map((stat) => ({
      name: stat.category || "Uncategorized",
      itemCount: stat._count.id,
      totalQuantity: stat._sum.quantity || 0,
      avgPrice: stat._avg.price || 0,
      avgCostPrice: stat._avg.costPrice || 0,
    }));

    // Add overall stats
    const totalItems = await prisma.inventory.count({
      where: {
        userId: user.id,
      },
    });

    const lowStockItems = await prisma.inventory.count({
      where: {
        userId: user.id,
        quantity: {
          lte: 10,
        },
      },
    });

    const outOfStockItems = await prisma.inventory.count({
      where: {
        userId: user.id,
        quantity: 0,
      },
    });

    return NextResponse.json({
      categories: categoriesWithStats,
      overview: {
        totalItems,
        totalCategories: categoriesWithStats.length,
        lowStockItems,
        outOfStockItems,
      },
    });
  } catch (error) {
    console.error("[INVENTORY_CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
