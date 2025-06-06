import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { z } from "zod";

const paymentSchema = z.object({
  paymentMode: z.enum(["CASH", "BANK"]),
});

const updateInstallmentSchema = z.object({
  amount: z.number().positive().optional(),
  dueDate: z.date().optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { installmentId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = paymentSchema.parse(body);

    // Get the installment
    const installment = await db.installment.findUnique({
      where: {
        id: params.installmentId,
      },
      include: {
        sale: {
          include: {
            customer: true,
          },
        },
      },
    });

    if (!installment) {
      return new NextResponse("Installment not found", { status: 404 });
    }

    if (installment.status === "PAID") {
      return new NextResponse("Installment already paid", { status: 400 });
    }

    // Update the installment
    const updatedInstallment = await db.installment.update({
      where: {
        id: params.installmentId,
      },
      data: {
        status: "PAID",
        paymentMode: validatedData.paymentMode,
        paidAt: new Date(),
        paidBy: user.id,
      },
    });

    // Create daybook entry
    const daybookEntry = await db.daybookEntry.create({
      data: {
        userId: user.id,
        customerId: installment.sale.customerId,
        installmentId: installment.id,
        type: "INCOME",
        amount: installment.amount,
        description: `Installment payment for sale (${installment.sale.reference})`,
        date: new Date(),
      },
    });

    // If payment mode is BANK, create a ledger entry
    if (validatedData.paymentMode === "BANK") {
      await db.ledgerEntry.create({
        data: {
          userId: user.id,
          customerId: installment.sale.customerId,
          type: "INCOME",
          title: `Installment Payment (${installment.sale.reference})`,
          amount: installment.amount,
          description: `Installment payment for sale`,
          transactionType: "CREDIT",
          paymentMethod: "BANK",
          date: new Date(),
        },
      });
    }

    return NextResponse.json({
      installment: updatedInstallment,
      daybookEntry,
    });
  } catch (error) {
    console.error("[INSTALLMENT_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(JSON.stringify({ error: error.errors }), {
        status: 400,
      });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { installmentId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateInstallmentSchema.parse(body);

    // Get the installment
    const installment = await db.installment.findUnique({
      where: {
        id: params.installmentId,
      },
    });

    if (!installment) {
      return new NextResponse("Installment not found", { status: 404 });
    }

    if (installment.status === "PAID") {
      return new NextResponse("Cannot edit paid installment", { status: 400 });
    }

    // Update the installment
    const updatedInstallment = await db.installment.update({
      where: {
        id: params.installmentId,
      },
      data: validatedData,
    });

    return NextResponse.json(updatedInstallment);
  } catch (error) {
    console.error("[INSTALLMENT_PUT]", error);
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
  { params }: { params: { installmentId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get the installment
    const installment = await db.installment.findUnique({
      where: {
        id: params.installmentId,
      },
    });

    if (!installment) {
      return new NextResponse("Installment not found", { status: 404 });
    }

    if (installment.status === "PAID") {
      return new NextResponse("Cannot delete paid installment", {
        status: 400,
      });
    }

    // Delete the installment
    await db.installment.delete({
      where: {
        id: params.installmentId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[INSTALLMENT_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { installmentId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const installment = await db.installment.findUnique({
      where: {
        id: params.installmentId,
      },
      include: {
        sale: {
          include: {
            customer: true,
            item: true,
          },
        },
      },
    });

    if (!installment) {
      return new NextResponse("Installment not found", { status: 404 });
    }

    return NextResponse.json(installment);
  } catch (error) {
    console.error("[INSTALLMENT_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
