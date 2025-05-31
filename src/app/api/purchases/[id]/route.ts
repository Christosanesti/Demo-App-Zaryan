import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserInDB } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

const updatePurchaseSchema = z.object({
  date: z
    .string()
    .transform((str) => new Date(str))
    .optional(),
  productName: z.string().min(1, "Product name is required").optional(),
  quantity: z.number().positive("Quantity must be greater than 0").optional(),
  unitPrice: z
    .number()
    .positive("Unit price must be greater than 0")
    .optional(),
  totalAmount: z
    .number()
    .positive("Total amount must be greater than 0")
    .optional(),
  description: z.string().optional(),
  category: z.string().optional(),
  supplierId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).optional(),
  notes: z.string().optional(),
});

// GET /api/purchases/[id]
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { clerkUser: user } = await ensureUserInDB();
    const params = await context.params;

    const purchase = await prisma.purchase.findUnique({
      where: {
        id: params.id,
        userId: user.id,
      },
      include: {
        supplier: true,
        daybookEntry: true,
        inventoryItems: {
          include: {
            inventory: true,
          },
        },
      },
    });

    if (!purchase) {
      return new NextResponse("Purchase not found", { status: 404 });
    }

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("[PURCHASE_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/purchases/[id]
export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { clerkUser: user } = await ensureUserInDB();
    const params = await context.params;

    const body = await req.json();
    const validationResult = updatePurchaseSchema.safeParse(body);

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

    // Start transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the existing purchase
      const existingPurchase = await tx.purchase.findUnique({
        where: {
          id: params.id,
          userId: user.id,
        },
        include: {
          inventoryItems: {
            include: {
              inventory: true,
            },
          },
          daybookEntry: true,
        },
      });

      if (!existingPurchase) {
        throw new Error("Purchase not found");
      }

      // Update the purchase
      const updatedPurchase = await tx.purchase.update({
        where: {
          id: params.id,
          userId: user.id,
        },
        data: {
          ...validatedData,
          amount: validatedData.totalAmount || existingPurchase.amount,
        },
      });

      // Update the associated daybook entry if it exists
      if (existingPurchase.daybookEntry) {
        await tx.daybookEntry.update({
          where: {
            id: existingPurchase.daybookEntry.id,
          },
          data: {
            date: validatedData.date || existingPurchase.date,
            amount: validatedData.totalAmount || existingPurchase.amount,
            description:
              validatedData.productName ?
                `Purchase: ${validatedData.productName}`
              : existingPurchase.daybookEntry.description,
            paymentMethod:
              validatedData.paymentMethod?.toLowerCase() ||
              existingPurchase.daybookEntry.paymentMethod,
            notes: validatedData.notes || existingPurchase.daybookEntry.notes,
          },
        });
      }

      // Handle inventory updates if quantity or product changed
      if (validatedData.quantity || validatedData.productName) {
        // Revert the old inventory changes
        for (const item of existingPurchase.inventoryItems) {
          await tx.inventory.update({
            where: { id: item.inventory.id },
            data: {
              quantity: item.inventory.quantity - item.quantity,
            },
          });
        }

        // Delete old inventory purchase items
        await tx.inventoryPurchaseItem.deleteMany({
          where: {
            purchaseId: params.id,
          },
        });

        // Apply new inventory changes
        const productName =
          validatedData.productName || existingPurchase.productName;
        const quantity = validatedData.quantity || existingPurchase.quantity;
        const unitPrice = validatedData.unitPrice || existingPurchase.unitPrice;

        let inventoryItem = await tx.inventory.findFirst({
          where: {
            name: productName,
            userId: user.id,
          },
        });

        if (!inventoryItem) {
          inventoryItem = await tx.inventory.create({
            data: {
              name: productName,
              description:
                validatedData.description || existingPurchase.description,
              quantity: quantity,
              price: unitPrice,
              costPrice: unitPrice,
              sellingPrice: unitPrice * 1.2,
              category:
                validatedData.category ||
                existingPurchase.category ||
                "General",
              userId: user.id,
              userName: user.firstName || "User",
            },
          });
        } else {
          // Update existing inventory item
          inventoryItem = await tx.inventory.update({
            where: { id: inventoryItem.id },
            data: {
              quantity: inventoryItem.quantity + quantity,
              costPrice: unitPrice,
            },
          });
        }

        // Create new inventory purchase item link
        await tx.inventoryPurchaseItem.create({
          data: {
            quantity: quantity,
            unitPrice: unitPrice,
            totalPrice: quantity * unitPrice,
            purchaseId: params.id,
            inventoryId: inventoryItem.id,
          },
        });
      }

      return updatedPurchase;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[PURCHASE_PATCH]", error);

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

// DELETE /api/purchases/[id] - Admin only
export async function DELETE(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { clerkUser: user } = await ensureUserInDB();
    const params = await context.params;

    // Check if user is admin (you can adjust this logic based on your admin system)
    const isAdmin = user.emailAddresses.some(
      (email) =>
        email.emailAddress.includes("admin") ||
        user.firstName?.toLowerCase().includes("admin")
    );

    if (!isAdmin) {
      return new NextResponse("Admin access required", { status: 403 });
    }

    // Start transaction for consistency
    const result = await prisma.$transaction(async (tx) => {
      // Get the purchase with all related data
      const purchase = await tx.purchase.findUnique({
        where: {
          id: params.id,
          userId: user.id,
        },
        include: {
          inventoryItems: {
            include: {
              inventory: true,
            },
          },
          daybookEntry: true,
        },
      });

      if (!purchase) {
        throw new Error("Purchase not found");
      }

      // Revert inventory changes
      for (const item of purchase.inventoryItems) {
        await tx.inventory.update({
          where: { id: item.inventory.id },
          data: {
            quantity: Math.max(0, item.inventory.quantity - item.quantity),
          },
        });
      }

      // Delete inventory purchase items
      await tx.inventoryPurchaseItem.deleteMany({
        where: {
          purchaseId: params.id,
        },
      });

      // Delete associated daybook entry
      if (purchase.daybookEntry) {
        await tx.daybookEntry.delete({
          where: {
            id: purchase.daybookEntry.id,
          },
        });
      }

      // Delete the purchase
      await tx.purchase.delete({
        where: {
          id: params.id,
          userId: user.id,
        },
      });

      return purchase;
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[PURCHASE_DELETE]", error);
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
