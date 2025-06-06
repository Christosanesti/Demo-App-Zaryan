import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse(JSON.stringify({ message: "Unauthorized" }), {
        status: 401,
      });
    }
    const overduePayments = await prisma.daybookEntry.findMany({
      where: {
        userId: user.id,
        type: "expense",
        status: "pending",
        date: {
          lt: new Date(),
        },
      },
      orderBy: {
        date: "asc",
      },
      include: {
        customer: true,
      },
    });
    return NextResponse.json({
      overduePayments: (overduePayments ?? []).map((entry) => ({
        ...entry,
        attachments: entry.attachments ? JSON.parse(entry.attachments) : [],
      })),
    });
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
