import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const inventorySchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantity cannot be negative"),
  price: z.number().positive("Price must be greater than 0"),
  costPrice: z
    .number()
    .positive("Cost price must be greater than 0")
    .optional(),
  sellingPrice: z
    .number()
    .positive("Selling price must be greater than 0")
    .optional(),
  category: z.string().optional(),
});

const updateInventorySchema = inventorySchema.partial();

// GET /api/inventory
export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const lowStock = searchParams.get("lowStock");

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (category && category !== "all") {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
        { category: { contains: search, mode: "insensitive" } },
      ];
    }

    if (lowStock === "true") {
      where.quantity = { lte: 10 }; // Items with 10 or fewer units
    }

    const inventory = await prisma.inventory.findMany({
      where,
      include: {
        purchaseItems: {
          include: {
            purchase: {
              select: {
                id: true,
                date: true,
                amount: true,
                supplier: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          take: 5, // Last 5 purchases
        },
        sales: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
          take: 5, // Last 5 sales
        },
        _count: {
          select: {
            purchaseItems: true,
            sales: true,
          },
        },
      },
      orderBy: [
        { quantity: "asc" }, // Low stock items first
        { name: "asc" },
      ],
    });

    // Calculate additional metrics for each item
    const inventoryWithMetrics = inventory.map((item) => {
      const totalPurchaseValue = item.purchaseItems.reduce(
        (sum, purchase) => sum + purchase.totalPrice,
        0
      );
      const totalSalesValue = item.sales.reduce(
        (sum, sale) => sum + sale.amount,
        0
      );

      return {
        ...item,
        metrics: {
          totalPurchaseValue,
          totalSalesValue,
          currentValue: item.quantity * (item.costPrice || item.price),
          estimatedProfit: totalSalesValue - totalPurchaseValue,
          isLowStock: item.quantity <= 10,
          isOutOfStock: item.quantity === 0,
        },
      };
    });

    return NextResponse.json(inventoryWithMetrics);
  } catch (error) {
    console.error("[INVENTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/inventory - Manual inventory addition
export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    console.log("Received inventory request body:", body);

    const validationResult = inventorySchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new NextResponse(
        JSON.stringify({
          message: "Validation error",
          errors: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedData = validationResult.data;
    console.log("Validated inventory data:", validatedData);

    // Check if inventory item with the same name already exists
    const existingItem = await prisma.inventory.findFirst({
      where: {
        name: validatedData.name,
        userId: user.id,
      },
    });

    if (existingItem) {
      return new NextResponse(
        JSON.stringify({
          message: "Inventory item with this name already exists",
          suggestion: "Use the update function to modify existing inventory",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Set default values if not provided
    const finalData = {
      ...validatedData,
      costPrice: validatedData.costPrice || validatedData.price,
      sellingPrice: validatedData.sellingPrice || validatedData.price * 1.2, // 20% markup default
      category: validatedData.category || "General",
    };

    const inventoryItem = await prisma.inventory.create({
      data: {
        ...finalData,
        userId: user.id,
        userName: user.firstName || "User",
      },
      include: {
        _count: {
          select: {
            purchaseItems: true,
            sales: true,
          },
        },
      },
    });

    console.log("Created inventory item:", inventoryItem);
    return NextResponse.json(inventoryItem);
  } catch (error) {
    console.error("[INVENTORY_POST] Error:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Validation error",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
