import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { addMonths, startOfDay } from "date-fns";

const createSaleSchema = z.object({
  customerId: z.string().min(1),
  inventoryId: z.string().min(1),
  amount: z.number().positive(),
  advancePayment: z.number().min(0),
  paymentMode: z.enum(["CASH", "BANK", "MOBILE"]),
  installmentMonths: z.number().int().min(1),
});

const saleSchema = z.object({
  customerId: z.string(),
  itemId: z.string(),
  totalAmount: z.number().positive(),
  advanceAmount: z.number().min(0),
  paymentMode: z.enum(["CASH", "BANK"]),
  duration: z.number().int().min(1),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = saleSchema.parse(body);

    // Generate a unique reference number
    const reference = `SALE-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Create the sale
    const sale = await db.sale.create({
      data: {
        userId: user.id,
        customerId: validatedData.customerId,
        itemId: validatedData.itemId,
        reference,
        totalAmount: validatedData.totalAmount,
        advanceAmount: validatedData.advanceAmount,
        paymentMode: validatedData.paymentMode,
        duration: validatedData.duration,
      },
    });

    // Calculate installment amount
    const remainingAmount =
      validatedData.totalAmount - validatedData.advanceAmount;
    const installmentAmount = remainingAmount / validatedData.duration;

    // Create installments
    const installments = await Promise.all(
      Array.from({ length: validatedData.duration }, (_, i) => {
        const dueDate = addMonths(new Date(), i + 1);
        return db.installment.create({
          data: {
            saleId: sale.id,
            userId: user.id,
            amount: installmentAmount,
            dueDate: startOfDay(dueDate),
            status: "PENDING",
          },
        });
      })
    );

    // Create daybook entry for the sale
    const daybookEntry = await db.daybookEntry.create({
      data: {
        userId: user.id,
        customerId: validatedData.customerId,
        saleId: sale.id,
        type: "INCOME",
        amount: validatedData.totalAmount,
        description: `Sale of item (${reference})`,
        date: new Date(),
      },
    });

    // If there's an advance payment, create a daybook entry for it
    if (validatedData.advanceAmount > 0) {
      await db.daybookEntry.create({
        data: {
          userId: user.id,
          customerId: validatedData.customerId,
          saleId: sale.id,
          type: "INCOME",
          amount: validatedData.advanceAmount,
          description: `Advance payment for sale (${reference})`,
          date: new Date(),
        },
      });
    }

    // If payment mode is BANK, create a ledger entry
    if (validatedData.paymentMode === "BANK") {
      await db.ledgerEntry.create({
        data: {
          userId: user.id,
          customerId: validatedData.customerId,
          type: "INCOME",
          title: `Sale Payment (${reference})`,
          amount: validatedData.advanceAmount,
          description: `Advance payment for sale`,
          transactionType: "CREDIT",
          paymentMethod: "BANK",
          date: new Date(),
        },
      });
    }

    return NextResponse.json({
      sale,
      installments,
      daybookEntry,
    });
  } catch (error) {
    console.error("[SALES_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
      });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");

    const sales = await db.sale.findMany({
      where: {
        userId: user.id,
        ...(customerId ? { customerId } : {}),
      },
      include: {
        customer: true,
        item: true,
        installments: {
          orderBy: {
            dueDate: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("[SALES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { clerkUser: user } = await ensureUserInDB();

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const sale = await prisma.sale.update({
      where: {
        id,
        userId: user.id,
      },
      data,
      include: {
        installments: true,
      },
    });

    return NextResponse.json(sale);
  } catch (error) {
    console.error("[SALE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { clerkUser: user } = await ensureUserInDB();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    await prisma.sale.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SALE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
