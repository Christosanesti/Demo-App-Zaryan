import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const purchaseSchema = z.object({
  date: z.date(),
  productName: z.string().min(1, "Product name is required"),
  quantity: z.string().min(1, "Quantity is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.string().min(1, "Price is required"),
  category: z.string().min(1, "Category is required"),
  supplier: z.string().min(1, "Supplier is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = purchaseSchema.parse(body);

    // Create the purchase record
    const purchase = await prisma.inventoryPurchase.create({
      data: {
        ...validatedData,
        userId: user.id,
        price: parseFloat(validatedData.price),
        quantity: parseFloat(validatedData.quantity),
      },
    });

    // Update or create inventory item
    const existingItem = await prisma.inventory.findFirst({
      where: {
        name: validatedData.productName,
        userId: user.id,
      },
    });

    if (existingItem) {
      await prisma.inventory.update({
        where: { id: existingItem.id },
        data: {
          quantity: existingItem.quantity + parseFloat(validatedData.quantity),
        },
      });
    } else {
      await prisma.inventory.create({
        data: {
          name: validatedData.productName,
          description: validatedData.notes || "",
          quantity: parseFloat(validatedData.quantity),
          unit: validatedData.unit,
          price: parseFloat(validatedData.price),
          category: validatedData.category,
          minStock: 0,
          maxStock: parseFloat(validatedData.quantity) * 2,
          supplier: validatedData.supplier,
          userId: user.id,
        },
      });
    }

    // Create daybook entry
    await prisma.daybookEntry.create({
      data: {
        date: validatedData.date,
        description: `Purchase: ${validatedData.productName}`,
        amount:
          parseFloat(validatedData.price) * parseFloat(validatedData.quantity),
        type: "EXPENSE",
        category: "Inventory",
        paymentMethod: validatedData.paymentMethod,
        userId: user.id,
      },
    });

    return NextResponse.json(purchase);
  } catch (error) {
    console.error("[INVENTORY_PURCHASE_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 422 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const purchases = await prisma.inventoryPurchase.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(purchases);
  } catch (error) {
    console.error("[INVENTORY_PURCHASE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
