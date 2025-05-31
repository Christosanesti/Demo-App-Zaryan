import { NextResponse } from "next/server";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";

const updateInventorySchema = z.object({
  name: z.string().min(1, "Product name is required").optional(),
  description: z.string().optional(),
  quantity: z.number().min(0, "Quantity cannot be negative").optional(),
  price: z.number().positive("Price must be greater than 0").optional(),
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

// GET /api/inventory/[id]
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;

    const inventoryItem = await prisma.inventory.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        purchaseItems: {
          include: {
            purchase: {
              include: {
                supplier: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        sales: {
          include: {
            customer: true,
            installments: {
              select: {
                id: true,
                amount: true,
                dueDate: true,
                paid: true,
              },
            },
          },
          orderBy: {
            date: "desc",
          },
        },
        _count: {
          select: {
            purchaseItems: true,
            sales: true,
          },
        },
      },
    });

    if (!inventoryItem) {
      return new NextResponse("Inventory item not found", { status: 404 });
    }

    // Calculate detailed metrics
    const totalPurchaseValue = inventoryItem.purchaseItems.reduce(
      (sum, purchase) => sum + purchase.totalPrice,
      0
    );

    const totalSalesValue = inventoryItem.sales.reduce(
      (sum, sale) => sum + sale.amount,
      0
    );

    const totalQuantityPurchased = inventoryItem.purchaseItems.reduce(
      (sum, purchase) => sum + purchase.quantity,
      0
    );

    // Calculate average purchase price
    const avgPurchasePrice =
      totalQuantityPurchased > 0 ?
        totalPurchaseValue / totalQuantityPurchased
      : 0;

    const itemWithMetrics = {
      ...inventoryItem,
      metrics: {
        totalPurchaseValue,
        totalSalesValue,
        totalQuantityPurchased,
        avgPurchasePrice,
        currentValue:
          inventoryItem.quantity *
          (inventoryItem.costPrice || inventoryItem.price),
        estimatedProfit: totalSalesValue - totalPurchaseValue,
        isLowStock: inventoryItem.quantity <= 10,
        isOutOfStock: inventoryItem.quantity === 0,
        turnoverRatio:
          totalQuantityPurchased > 0 ?
            (totalQuantityPurchased - inventoryItem.quantity) /
            totalQuantityPurchased
          : 0,
      },
    };

    return NextResponse.json(itemWithMetrics);
  } catch (error: any) {
    console.error("[INVENTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/inventory/[id]
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;
    const body = await req.json();
    const validationResult = updateInventorySchema.safeParse(body);

    if (!validationResult.success) {
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

    // Check if the item exists
    const existingItem = await prisma.inventory.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    if (!existingItem) {
      return new NextResponse("Inventory item not found", { status: 404 });
    }

    // Check if name is being changed and if it conflicts with another item
    if (validatedData.name && validatedData.name !== existingItem.name) {
      const nameConflict = await prisma.inventory.findFirst({
        where: {
          name: validatedData.name,
          userId: user.id,
          id: { not: params.id },
        },
      });

      if (nameConflict) {
        return new NextResponse(
          JSON.stringify({
            message: "An inventory item with this name already exists",
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
    }

    // Update the inventory item
    const updatedItem = await prisma.inventory.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: validatedData,
      include: {
        _count: {
          select: {
            purchaseItems: true,
            sales: true,
          },
        },
      },
    });

    return NextResponse.json(updatedItem);
  } catch (error: any) {
    console.error("[INVENTORY_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/inventory/[id]
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;

    // Check if the item exists
    const existingItem = await prisma.inventory.findUnique({
      where: {
        id: params.id,
        userId: user.id,
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

    if (!existingItem) {
      return new NextResponse("Inventory item not found", { status: 404 });
    }

    // Check if the item has associated purchases or sales
    if (
      existingItem._count.purchaseItems > 0 ||
      existingItem._count.sales > 0
    ) {
      return new NextResponse(
        JSON.stringify({
          message:
            "Cannot delete inventory item with associated purchases or sales. Please remove related transactions first.",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Delete the inventory item
    await prisma.inventory.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[INVENTORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
