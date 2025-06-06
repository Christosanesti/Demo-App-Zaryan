import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthUser } from "@/lib/auth";

export async function GET() {
  try {
    const { user } = await getAuthUser();

    const overduePayments = await prisma.daybookEntry.findMany({
      where: {
        userId: user.id,
        type: "expense",
        status: "pending",
        dueDate: {
          lt: new Date(), // Less than current date
        },
      },
      orderBy: {
        dueDate: "asc",
      },
      include: {
        customer: true, // Include customer details if you have a relation
      },
    });

    return NextResponse.json({ overduePayments });
  } catch (error) {
    console.error("[OVERDUE_PAYMENTS_GET]", error);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch overdue payments",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
