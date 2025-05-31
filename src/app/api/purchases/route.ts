import { NextResponse } from "next/server";
import { z } from "zod";
import { ensureUserInDB } from "@/lib/auth-utils";
import prisma from "@/lib/prisma";

const purchaseSchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.number().positive("Quantity must be greater than 0"),
  unitPrice: z.number().positive("Unit price must be greater than 0"),
  totalAmount: z.number().positive("Total amount must be greater than 0"),
  description: z.string().optional(),
  category: z.string().optional(),
  supplierId: z.string().optional(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE"]).default("CASH"),
  status: z.enum(["PENDING", "COMPLETED", "CANCELLED"]).default("COMPLETED"),
  notes: z.string().optional(),
});

const updatePurchaseSchema = purchaseSchema.partial();

// GET /api/purchases
export async function GET() {
  try {
    const { clerkUser: user } = await ensureUserInDB();

    const purchases = await prisma.purchase.findMany({
      where: {
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
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("[PURCHASES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/purchases
export async function POST(req: Request) {
  try {
    const { clerkUser: user } = await ensureUserInDB();

    const body = await req.json();
    console.log("Received purchase request body:", body);

    const validationResult = purchaseSchema.safeParse(body);

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
    console.log("Validated purchase data:", validatedData);

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the purchase entry
      const purchase = await tx.purchase.create({
        data: {
          ...validatedData,
          amount: validatedData.totalAmount,
          userId: user.id,
          userName: user.firstName || "User",
        },
      });

      // Create corresponding daybook entry (expense)
      const daybookEntry = await tx.daybookEntry.create({
        data: {
          date: validatedData.date,
          type: "expense",
          amount: validatedData.totalAmount,
          description: `Purchase: ${validatedData.productName}`,
          reference: `Purchase #${purchase.id.slice(-8)}`,
          category: "Inventory Purchase",
          paymentMethod: validatedData.paymentMethod.toLowerCase(),
          status: "completed",
          notes:
            validatedData.notes ||
            `Purchased ${validatedData.quantity} units of ${validatedData.productName}`,
          userId: user.id,
          userName: user.firstName || "User",
          purchaseId: purchase.id,
        },
      });

      // Check if inventory item exists, if not create it
      let inventoryItem = await tx.inventory.findFirst({
        where: {
          name: validatedData.productName,
          userId: user.id,
        },
      });

      if (!inventoryItem) {
        inventoryItem = await tx.inventory.create({
          data: {
            name: validatedData.productName,
            description: validatedData.description,
            quantity: validatedData.quantity,
            price: validatedData.unitPrice,
            costPrice: validatedData.unitPrice,
            sellingPrice: validatedData.unitPrice * 1.2, // 20% markup as default
            category: validatedData.category || "General",
            userId: user.id,
            userName: user.firstName || "User",
          },
        });
      } else {
        // Update existing inventory item
        inventoryItem = await tx.inventory.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: inventoryItem.quantity + validatedData.quantity,
            costPrice: validatedData.unitPrice, // Update with latest cost price
          },
        });
      }

      // Create inventory purchase item link
      await tx.inventoryPurchaseItem.create({
        data: {
          quantity: validatedData.quantity,
          unitPrice: validatedData.unitPrice,
          totalPrice: validatedData.totalAmount,
          purchaseId: purchase.id,
          inventoryId: inventoryItem.id,
        },
      });

      return { purchase, daybookEntry, inventoryItem };
    });

    console.log("Created purchase with inventory sync:", result);
    return NextResponse.json(result.purchase);
  } catch (error) {
    console.error("[PURCHASES_POST] Error:", error);

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
