import { prisma } from "@/lib/prisma";
import { Period, TimeFrame } from "@/lib/types";
import { currentUser } from "@clerk/nextjs/server";
import { getDaysInMonth } from "date-fns";
import { redirect } from "next/navigation";
import z from "zod";
import { NextResponse } from "next/server";

type HistoryData = {
  month: number;
  expense: number;
  income: number;
  year: number;
  day?: number;
};

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("sign-in");
  }

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
  const result = await prisma.yearHistory.groupBy({
    by: ["month"],
    where: {
      userId,
      year,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: {
      month: "asc",
    },
  });

  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];

  for (let i = 0; i < 12; i++) {
    let expense = 0;
    let income = 0;

    const month = result.find((row) => row.month === i);
    if (month) {
      expense = month._sum.expense || 0;
      income = month._sum.income || 0;
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
  const result = await prisma.monthHistory.groupBy({
    by: ["day"],
    where: {
      userId,
      month,
      year,
    },
    _sum: {
      expense: true,
      income: true,
    },
    orderBy: {
      day: "asc",
    },
  });

  if (!result || result.length === 0) return [];

  const history: HistoryData[] = [];
  const daysInMonth = getDaysInMonth(new Date(year, month));

  for (let i = 0; i < daysInMonth; i++) {
    let expense = 0;
    let income = 0;

    const day = result.find((row) => row.day === i);
    if (day) {
      expense = day._sum.expense || 0;
      income = day._sum.income || 0;
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
  const user = await currentUser();
  if (!user) return new NextResponse("Unauthorized", { status: 401 });

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
