import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth-utils";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get total due amount from ledger entries
    const totalDue = await db.ledgerEntry.aggregate({
      where: {
        userId: user.id,
        type: "CUSTOMER",
        transactionType: "DEBIT",
      },
      _sum: {
        amount: true,
      },
    });

    // Get total sales from ledger entries
    const totalSales = await db.ledgerEntry.aggregate({
      where: {
        userId: user.id,
        type: "SALE",
        transactionType: "CREDIT",
      },
      _sum: {
        amount: true,
      },
    });

    // Get total inventory value
    const totalInventory = await db.inventory.aggregate({
      where: {
        userId: user.id,
      },
      _sum: {
        price: true,
      },
    });

    // Get total customers
    const totalCustomers = await db.customer.count({
      where: {
        userId: user.id,
      },
    });

    return NextResponse.json({
      totalDue: totalDue._sum?.amount || 0,
      totalSales: totalSales._sum?.amount || 0,
      totalInventory: totalInventory._sum?.price || 0,
      totalCustomers,
    });
  } catch (error) {
    console.error("[DASHBOARD_STATS]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
