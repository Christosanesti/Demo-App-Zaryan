import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { db } from "@/lib/db";

const categoriesSchema = z.object({
  type: z.enum(["sales", "inventory"]).default("sales"),
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
    const type = searchParams.get("type") || "sales";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    const validatedData = categoriesSchema.parse({
      type,
      from: from || undefined,
      to: to || undefined,
    });

    if (validatedData.type === "sales") {
      // Get sales data by category
      const salesByCategory = await db.sale.groupBy({
        by: ["category"],
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

      // Calculate total sales for percentage
      const totalSales = salesByCategory.reduce(
        (sum, category) => sum + (category._sum.totalAmount || 0),
        0
      );

      // Format data for the chart
      const formattedData = salesByCategory.map((category) => ({
        name: category.category,
        value: category._sum.totalAmount || 0,
        color: getCategoryColor(category.category),
        percentage: ((category._sum.totalAmount || 0) / totalSales) * 100,
        count: category._count.id,
      }));

      return NextResponse.json({ data: formattedData });
    } else {
      // Get inventory data by category
      const inventoryByCategory = await db.inventory.groupBy({
        by: ["category"],
        where: {
          userId: user.id,
        },
        _sum: {
          value: true,
          quantity: true,
        },
        _count: {
          id: true,
        },
      });

      // Calculate total inventory value for percentage
      const totalValue = inventoryByCategory.reduce(
        (sum, category) => sum + (category._sum.value || 0),
        0
      );

      // Format data for the chart
      const formattedData = inventoryByCategory.map((category) => ({
        name: category.category,
        value: category._sum.value || 0,
        color: getCategoryColor(category.category),
        percentage: ((category._sum.value || 0) / totalValue) * 100,
        count: category._count.id,
      }));

      return NextResponse.json({ data: formattedData });
    }
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// Helper function to assign consistent colors to categories
function getCategoryColor(category: string): string {
  const colors = {
    Electronics: "#3B82F6",
    Clothing: "#10B981",
    "Food & Beverage": "#F59E0B",
    "Home Goods": "#8B5CF6",
    Others: "#EC4899",
  };

  return colors[category as keyof typeof colors] || "#6B7280";
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
