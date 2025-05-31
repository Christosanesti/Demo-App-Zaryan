import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/prisma";

const ledgerEntrySchema = z.object({
  type: z.enum([
    "BANK",
    "EXPENSE",
    "SALARY",
    "PURCHASE",
    "SALE",
    "CUSTOMER",
    "CUSTOM",
  ]),
  customType: z.string().optional(),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  amount: z.number().positive("Amount must be positive"),
  transactionType: z.enum(["DEBIT", "CREDIT"]),
  date: z.string().min(1, "Date is required"),
  reference: z.string().optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(["CASH", "BANK", "MOBILE"]).optional(),
  tags: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");

    let whereClause: any = {
      userId: user.id,
    };

    if (type && type !== "all") {
      whereClause.type = type;
    }

    const ledgerEntries = await prisma.ledgerEntry.findMany({
      where: whereClause,
      orderBy: {
        date: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(ledgerEntries);
  } catch (error) {
    console.error("[LEDGERS_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch ledger entries" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = ledgerEntrySchema.parse(body);

    // Create the ledger entry
    const ledgerEntry = await prisma.ledgerEntry.create({
      data: {
        ...validatedData,
        userId: user.id,
        date: new Date(validatedData.date),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json(ledgerEntry, { status: 201 });
  } catch (error) {
    console.error("[LEDGERS_POST]", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create ledger entry" },
      { status: 500 }
    );
  }
}
