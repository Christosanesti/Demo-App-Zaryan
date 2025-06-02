import prisma from "@/lib/prisma";
import { Period, TimeFrame } from "@/lib/types";
import { ensureUserInDB } from "@/lib/auth-utils";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import z from "zod";
import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";

type HistoryData = {
  month: number;
  expense: number;
  income: number;
  year: number;
  day?: number;
};

export async function GET(request: Request) {
  const { clerkUser: user } = await ensureUserInDB();

  const { searchParams } = new URL(request.url);
  const timeFrameParam = searchParams.get("timeFrame");
  const monthParam = searchParams.get("month");
  const yearParam = searchParams.get("year");

  const getHistoryDataSchema = z.object({
    timeFrame: z.enum(["month", "year"]),
    year: z.coerce.number().min(2000).max(2040),
    month: z.coerce.number().min(0).max(11).default(0),
  });

  const parsedParams = getHistoryDataSchema.safeParse({
    timeFrame: timeFrameParam,
    year: yearParam,
    month: monthParam,
  });

  if (!parsedParams.success) {
    return Response.json(
      { error: parsedParams.error.message },
      { status: 400 }
    );
  }

  const historyData = await getHistoryData(
    user.id,
    parsedParams.data.timeFrame,
    {
      month: parsedParams.data.month,
      year: parsedParams.data.year,
    }
  );

  return Response.json(historyData);
}

export type GetHistoryDataResponseType = Awaited<
  ReturnType<typeof getHistoryData>
>;

async function getHistoryData(
  userId: string,
  timeFrame: TimeFrame,
  period: Period
): Promise<HistoryData[]> {
  switch (timeFrame) {
    case "year":
      return await getYearHistoryData(userId, period.year);
    case "month":
      return await getMonthHistoryData(userId, period.month, period.year);
    default:
      throw new Error("Invalid time frame");
  }
}

async function getYearHistoryData(
  userId: string,
  year: number
): Promise<HistoryData[]> {
  const entries = await prisma.daybookEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, 0, 1),
        lt: new Date(year + 1, 0, 1),
      },
    },
    select: {
      date: true,
      type: true,
      amount: true,
    },
  });

  const history: HistoryData[] = [];

  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;

    // Filter entries for this month and calculate totals
    const monthEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getMonth() === i;
    });

    for (const entry of monthEntries) {
      if (entry.type === "expense") {
        expense += entry.amount;
      } else if (entry.type === "income") {
        income += entry.amount;
      }
    }

    history.push({
      month: i,
      expense,
      income,
      year,
    });
  }

  return history;
}

async function getMonthHistoryData(
  userId: string,
  month: number,
  year: number
): Promise<HistoryData[]> {
  const entries = await prisma.daybookEntry.findMany({
    where: {
      userId,
      date: {
        gte: new Date(year, month, 1),
        lt: new Date(year, month + 1, 1),
      },
    },
    select: {
      date: true,
      type: true,
      amount: true,
    },
  });

  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  for (let i = 1; i <= daysInMonth; i++) {
    let expense = 0;
    let income = 0;

    // Filter entries for this day and calculate totals
    const dayEntries = entries.filter((entry) => {
      const entryDate = new Date(entry.date);
      return entryDate.getDate() === i;
    });

    for (const entry of dayEntries) {
      if (entry.type === "expense") {
        expense += entry.amount;
      } else if (entry.type === "income") {
        income += entry.amount;
      }
    }

    history.push({
      month,
      day: i,
      expense,
      income,
      year,
    });
  }

  return history;
}

const createEntrySchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  reference: z.string().min(1),
});

export async function POST(req: Request) {
  const { user } = await getAuthUser();

  const body = await req.json();
  const validatedData = createEntrySchema.parse(body);

  const entry = await prisma.daybookEntry.create({
    data: {
      ...validatedData,
      userId: user.id,
      userName: user.firstName || "User",
    },
  });

  return NextResponse.json(entry);
}
