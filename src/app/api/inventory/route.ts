import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const createInventorySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  quantity: z.number().int().min(0),
  unit: z.string().min(1),
  price: z.number().positive(),
  category: z.string().min(1),
  supplier: z.string().optional(),
  location: z.string().optional(),
  minStock: z.number().int().min(0).optional(),
  maxStock: z.number().int().min(0).optional(),
  status: z.enum(["in_stock", "low_stock", "out_of_stock"]),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = createInventorySchema.parse(body);

    const inventory = await db.inventory.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("[INVENTORY_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
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

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {
      userId: user.id,  
      ...(category && { category }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { description: { contains: search, mode: "insensitive" } },
          { supplier: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const inventory = await db.inventory.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("[INVENTORY_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const inventory = await db.inventory.update({
      where: {
        id,
        userId: user.id,
      },
      data,
    });

    return NextResponse.json(inventory);
  } catch (error) {
    console.error("[INVENTORY_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
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
      return new NextResponse("ID is required", { status: 400 });
    }

    await db.inventory.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INVENTORY_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
