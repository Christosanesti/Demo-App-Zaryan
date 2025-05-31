import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get all ledger entries for the user
    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: {
        userId: user.id,
      },
      select: {
        amount: true,
        transactionType: true,
        type: true,
      },
    });

    // Calculate statistics
    let totalCredits = 0;
    let totalDebits = 0;
    const totalTransactions = ledgerEntries.length;

    // Calculate credits and debits
    ledgerEntries.forEach((entry) => {
      if (entry.transactionType === "CREDIT") {
        totalCredits += entry.amount;
      } else if (entry.transactionType === "DEBIT") {
        totalDebits += entry.amount;
      }
    });

    // Calculate balance (credits - debits)
    const totalBalance = totalCredits - totalDebits;

    // Get ledger type breakdown
    const ledgerTypeStats = ledgerEntries.reduce((acc: any, entry) => {
      if (!acc[entry.type]) {
        acc[entry.type] = {
          count: 0,
          credits: 0,
          debits: 0,
          balance: 0,
        };
      }

      acc[entry.type].count += 1;

      if (entry.transactionType === "CREDIT") {
        acc[entry.type].credits += entry.amount;
      } else {
        acc[entry.type].debits += entry.amount;
      }

      acc[entry.type].balance =
        acc[entry.type].credits - acc[entry.type].debits;

      return acc;
    }, {});

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentEntries = await prisma.ledgerEntry.findMany({
      where: {
        userId: user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      select: {
        amount: true,
        transactionType: true,
        date: true,
      },
    });

    // Calculate recent statistics
    let recentCredits = 0;
    let recentDebits = 0;

    recentEntries.forEach((entry) => {
      if (entry.transactionType === "CREDIT") {
        recentCredits += entry.amount;
      } else {
        recentDebits += entry.amount;
      }
    });

    const stats = {
      totalBalance,
      totalCredits,
      totalDebits,
      totalTransactions,
      recentCredits,
      recentDebits,
      recentTransactions: recentEntries.length,
      ledgerTypeStats,
      lastUpdated: new Date().toISOString(),
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("[LEDGERS_STATS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger statistics" },
      { status: 500 }
    );
  }
}
