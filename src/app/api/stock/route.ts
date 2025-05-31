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

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stocks = await prisma.stock.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(stocks);
  } catch (error) {
    console.error("[STOCK_GET]", error);
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
    const validatedData = stockSchema.parse(body);

    // Create stock entry
    const stock = await prisma.stock.create({
      data: {
        ...validatedData,
        userId: user.id,
        userName: user.firstName || "User",
      },
    });

    // Create corresponding daybook entry
    const daybookEntry = await prisma.daybookEntry.create({
      data: {
        date: new Date(validatedData.date),
        type: "expense",
        amount: validatedData.amount,
        description: `Stock purchase: ${validatedData.productName}`,
        reference: `STOCK-${stock.id}`,
        userId: user.id,
        userName: user.firstName || "User",
        stockId: stock.id,
      },
    });

    return NextResponse.json({ stock, daybookEntry });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    console.error("[STOCK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
