import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const inventorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  quantity: z.number().int().min(0, "Quantity must be positive"),
  unit: z.string().default("piece"),
  price: z.number().positive("Price must be positive"),
  category: z.string().default("uncategorized"),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  location: z.string().optional(),
  minStock: z.number().int().min(0).default(0),
  maxStock: z.number().int().positive().optional(),
  supplier: z.string().optional(),
  notes: z.string().optional(),
});

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const items = await prisma.inventory.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const totals = {
      totalItems: items.length,
      totalValue: items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0
      ),
    };

    const categoryTotals = items.reduce(
      (acc, item) => {
        const category = item.category || "uncategorized";
        if (!acc[category]) {
          acc[category] = { items: 0, value: 0 };
        }
        acc[category].items += 1;
        acc[category].value += item.price * item.quantity;
        return acc;
      },
      {} as Record<string, { items: number; value: number }>
    );

    return NextResponse.json({
      items,
      totals,
      categoryTotals,
    });
  } catch (error) {
    console.error("[INVENTORY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = inventorySchema.parse(body);

    const inventory = await prisma.inventory.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    console.error("[INVENTORY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    const inventory = await prisma.inventory.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("[INVENTORY_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
