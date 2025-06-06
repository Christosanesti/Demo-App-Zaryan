import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total due amount from installments
    const totalDueAmount = await db.installment.aggregate({
      where: {
        userId: user.id,
        status: "PENDING",
      },
      _sum: {
        amount: true,
      },
    });

    // Get total profit (Sales - Purchases)
    const sales = await db.sale.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const purchases = await db.purchase.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        totalAmount: true,
      },
    });

    const totalProfit =
      (sales._sum.totalAmount || 0) - (purchases._sum.totalAmount || 0);

    // Get due payments with enhanced details
    const today = new Date();
    const thirtyDaysFromNow = addDays(today, 30);

    const duePayments = await db.installment.findMany({
      where: {
        userId: user.id,
        status: "PENDING",
        dueDate: {
          lte: thirtyDaysFromNow,
          gte: startOfDay(today),
        },
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true,
            phone: true,
          },
        },
        sale: {
          select: {
            reference: true,
            totalAmount: true,
          },
        },
      },
      orderBy: [
        {
          dueDate: "asc",
        },
        {
          amount: "desc",
        },
      ],
      take: 10,
    });

    // Calculate payment statistics
    const paymentStats = {
      overdue: await db.installment.count({
        where: {
          userId: user.id,
          status: "PENDING",
          dueDate: {
            lt: startOfDay(today),
          },
        },
      }),
      dueToday: await db.installment.count({
        where: {
          userId: user.id,
          status: "PENDING",
          dueDate: {
            gte: startOfDay(today),
            lte: endOfDay(today),
          },
        },
      }),
      dueThisWeek: await db.installment.count({
        where: {
          userId: user.id,
          status: "PENDING",
          dueDate: {
            gte: startOfDay(today),
            lte: endOfDay(addDays(today, 7)),
          },
        },
      }),
    };

    return NextResponse.json({
      totalDueAmount: totalDueAmount._sum.amount || 0,
      totalProfit,
      paymentStats,
      duePayments: duePayments.map((payment) => ({
        id: payment.id,
        customerName: payment.customer.name,
        customerEmail: payment.customer.email,
        customerPhone: payment.customer.phone,
        amount: payment.amount,
        dueDate: payment.dueDate,
        reference: payment.sale?.reference,
        originalAmount: payment.sale?.totalAmount,
        daysUntilDue: Math.ceil(
          (new Date(payment.dueDate).getTime() - today.getTime()) /
            (1000 * 60 * 60 * 24)
        ),
        isOverdue: new Date(payment.dueDate) < today,
      })),
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
