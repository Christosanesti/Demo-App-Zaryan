import { NextResponse } from "next/server";
import { ensureUserInDB } from "@/lib/auth-utils";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const createSaleSchema = z.object({
  customerId: z.string().min(1),
  inventoryId: z.string().min(1),
  amount: z.number().positive(),
  advancePayment: z.number().min(0),
  paymentMode: z.enum(["CASH", "BANK", "MOBILE"]),
  installmentMonths: z.number().int().min(1),
});

export async function POST(req: Request) {
  try {
    const { clerkUser: user } = await ensureUserInDB();

    const body = await req.json();
    const validatedData = createSaleSchema.parse(body);

    // Start a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create the sale
      const sale = await tx.sale.create({
        data: {
          customerId: validatedData.customerId,
          amount: validatedData.amount,
          paymentMode: validatedData.paymentMode,
          installmentMonths: validatedData.installmentMonths,
          advance: validatedData.advancePayment,
          userId: user.id,
          userName:
            user.firstName || user.emailAddresses[0]?.emailAddress || "Unknown",
          date: new Date(),
          itemId: validatedData.inventoryId,
        },
      });

      // Calculate installment amount
      const remainingAmount =
        validatedData.amount - validatedData.advancePayment;
      const installmentAmount =
        remainingAmount / validatedData.installmentMonths;

      // Create installments
      const installments = [];
      for (let i = 0; i < validatedData.installmentMonths; i++) {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);

        installments.push(
          tx.installment.create({
            data: {
              saleId: sale.id,
              customerId: validatedData.customerId,
              userId: user.id,
              userName:
                user.firstName ||
                user.emailAddresses[0]?.emailAddress ||
                "Unknown",
              amount: installmentAmount,
              dueDate,
              date: new Date(),
              description: `Installment ${i + 1} for sale #${sale.id}`,
            },
          })
        );
      }

      // Create daybook entry for advance payment if any
      if (validatedData.advancePayment > 0) {
        await tx.daybookEntry.create({
          data: {
            userId: user.id,
            userName:
              user.firstName ||
              user.emailAddresses[0]?.emailAddress ||
              "Unknown",
            date: new Date(),
            amount: validatedData.advancePayment,
            type: "income",
            description: `Advance payment for sale #${sale.id}`,
            reference: `SALE-${sale.id}`,
            category: "sales",
            paymentMethod: validatedData.paymentMode,
            status: "completed",
          },
        });
      }

      // Update inventory quantity
      await tx.inventory.update({
        where: { id: validatedData.inventoryId },
        data: {
          quantity: {
            decrement: 1,
          },
        },
      });

      return { sale, installments: await Promise.all(installments) };
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[SALE_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { clerkUser: user } = await ensureUserInDB();

    const { searchParams } = new URL(req.url);
    const customerId = searchParams.get("customerId");
    const status = searchParams.get("status");

    const where = {
      userId: user.id,
      ...(customerId && { customerId }),
      ...(status && { status }),
    };

    const sales = await prisma.sale.findMany({
      where,
      include: {
        customer: true,
        item: true,
        installments: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(sales);
  } catch (error) {
    console.error("[SALE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
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
