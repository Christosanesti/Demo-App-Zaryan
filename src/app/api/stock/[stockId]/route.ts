import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const stockSchema = z.object({
  date: z.string(),
  productName: z.string().min(1, "Product name is required"),
  amount: z.number().positive(),
  quantity: z.number().int().positive(),
  description: z.string().optional(),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ stockId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;

    const stock = await prisma.stock.findUnique({
      where: {
        id: params.stockId,
        userId: user.id,
      },
    });

    if (!stock) {
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(stock);
  } catch (error) {
    console.error("[STOCK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ stockId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;

    const body = await req.json();
    const validatedData = stockSchema.parse(body);

    const stock = await prisma.stock.findUnique({
      where: {
        id: params.stockId,
        userId: user.id,
      },
      include: {
        daybookEntry: true,
      },
    });

    if (!stock) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Update stock entry
    const updatedStock = await prisma.stock.update({
      where: {
        id: params.stockId,
      },
      data: {
        ...validatedData,
      },
    });

    // Update corresponding daybook entry
    if (stock.daybookEntry) {
      await prisma.daybookEntry.update({
        where: {
          id: stock.daybookEntry.id,
        },
        data: {
          date: new Date(validatedData.date),
          amount: validatedData.amount,
          description: `Stock purchase: ${validatedData.productName}`,
        },
      });
    }

    return NextResponse.json(updatedStock);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    console.error("[STOCK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ stockId: string }> }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const params = await context.params;

    const stock = await prisma.stock.findUnique({
      where: {
        id: params.stockId,
        userId: user.id,
      },
      include: {
        daybookEntry: true,
      },
    });

    if (!stock) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Delete stock entry and its corresponding daybook entry
    await prisma.stock.delete({
      where: {
        id: params.stockId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STOCK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
