import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "../../../lib/db";
import { z } from "zod";

const updateInstallmentSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["pending", "paid", "overdue"]),
  paymentDate: z.date().optional(),
  paymentMethod: z.enum(["cash", "bank"]).optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const saleId = searchParams.get("saleId");
    const status = searchParams.get("status");
    const dueDate = searchParams.get("dueDate");

    const where = {
      sale: {
        userId: user.id,
        ...(saleId && { id: saleId }),
      },
      ...(status && { status }),
      ...(dueDate && { dueDate: new Date(dueDate) }),
    };

    const installments = await db.installment.findMany({
      where,
      include: {
        sale: {
          include: {
            customer: true,
            inventory: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    return NextResponse.json(installments);
  } catch (error) {
    console.error("[INSTALLMENT_GET]", error);
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
    const validatedData = updateInstallmentSchema.parse(body);

    // Start a transaction
    const result = await db.$transaction(async (tx) => {
      // Update the installment
      const installment = await tx.installment.update({
        where: {
          id: validatedData.id,
          sale: {
            userId: user.id,
          },
        },
        data: {
          status: validatedData.status,
          paymentDate: validatedData.paymentDate,
          paymentMethod: validatedData.paymentMethod,
          notes: validatedData.notes,
        },
        include: {
          sale: true,
        },
      });

      // If marking as paid, create a daybook entry
      if (validatedData.status === "paid" && validatedData.paymentDate && validatedData.paymentMethod) {
        await tx.daybookEntry.create({
          data: {
            userId: user.id,
            date: validatedData.paymentDate,
            amount: installment.amount,
            type: "income",
            description: `Installment payment for sale #${installment.saleId}`,
            reference: `INST-${installment.id}`,
            category: "installments",
            paymentMethod: validatedData.paymentMethod,
            status: "completed",
          },
        });
      }

      return installment;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("[INSTALLMENT_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
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

    await db.installment.delete({
      where: {
        id,
        sale: {
          userId: user.id,
        },
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INSTALLMENT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 