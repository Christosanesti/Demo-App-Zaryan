import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const updateSaleSchema = z.object({
  totalAmount: z.number().positive().optional(),
  advanceAmount: z.number().min(0).optional(),
  paymentMode: z.enum(["CASH", "BANK"]).optional(),
  duration: z.number().int().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { saleId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateSaleSchema.parse(body);

    // Get the sale
    const sale = await db.sale.findUnique({
      where: {
        id: params.saleId,
        userId: user.id,
      },
      include: {
        installments: true,
      },
    });

    if (!sale) {
      return new NextResponse("Sale not found", { status: 404 });
    }

    // Check if any installments are already paid
    const hasPaidInstallments = sale.installments.some(
      (i) => i.status === "PAID"
    );

    if (hasPaidInstallments) {
      return new NextResponse("Cannot edit sale with paid installments", {
        status: 400,
      });
    }

    // Update the sale
    const updatedSale = await db.sale.update({
      where: {
        id: params.saleId,
      },
      data: validatedData,
    });

    // If total amount or duration changed, update installments
    if (validatedData.totalAmount || validatedData.duration) {
      const remainingAmount =
        (validatedData.totalAmount || sale.totalAmount) -
        (validatedData.advanceAmount || sale.advanceAmount);
      const installmentAmount =
        remainingAmount / (validatedData.duration || sale.duration);

      // Delete existing installments
      await db.installment.deleteMany({
        where: {
          saleId: params.saleId,
        },
      });

      // Create new installments
      await Promise.all(
        Array.from(
          { length: validatedData.duration || sale.duration },
          (_, i) => {
            const dueDate = new Date();
            dueDate.setMonth(dueDate.getMonth() + i + 1);
            return db.installment.create({
              data: {
                saleId: params.saleId,
                userId: user.id,
                amount: installmentAmount,
                dueDate,
                status: "PENDING",
              },
            });
          }
        )
      );
    }

    return NextResponse.json(updatedSale);
  } catch (error) {
    console.error("[SALE_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
      });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { saleId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the sale
    const sale = await db.sale.findUnique({
      where: {
        id: params.saleId,
        userId: user.id,
      },
      include: {
        installments: true,
      },
    });

    if (!sale) {
      return new NextResponse("Sale not found", { status: 404 });
    }

    // Check if any installments are already paid
    const hasPaidInstallments = sale.installments.some(
      (i) => i.status === "PAID"
    );

    if (hasPaidInstallments) {
      return new NextResponse("Cannot delete sale with paid installments", {
        status: 400,
      });
    }

    // Delete the sale (this will cascade delete installments and related entries)
    await db.sale.delete({
      where: {
        id: params.saleId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[SALE_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
