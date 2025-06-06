import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startOfDay } from "date-fns";

export async function GET(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const today = startOfDay(new Date());

    // Get all due installments
    const dueInstallments = await db.installment.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
        dueDate: {
          lte: today,
        },
      },
      include: {
        sale: {
          include: {
            customer: true,
            item: true,
          },
        },
      },
      orderBy: {
        dueDate: "asc",
      },
    });

    // Calculate total due amount
    const totalDueAmount = dueInstallments.reduce(
      (sum, installment) => sum + installment.amount,
      0
    );

    // Group installments by customer
    const customerDueInstallments = dueInstallments.reduce(
      (acc, installment) => {
        const customerId = installment.sale.customerId;
        if (!acc[customerId]) {
          acc[customerId] = {
            customer: installment.sale.customer,
            installments: [],
            totalDue: 0,
          };
        }
        acc[customerId].installments.push(installment);
        acc[customerId].totalDue += installment.amount;
        return acc;
      },
      {} as Record<
        string,
        { customer: any; installments: any[]; totalDue: number }
      >
    );

    return NextResponse.json({
      totalDueAmount,
      customerDueInstallments: Object.values(customerDueInstallments),
      dueInstallments,
    });
  } catch (error) {
    console.error("[DUE_INSTALLMENTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
