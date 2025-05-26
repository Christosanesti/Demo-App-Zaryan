import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { OverviewQuerySchema } from "../../../../../schema/overview";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);

  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const queryParams = OverviewQuerySchema.safeParse({
    from,
    to,
  });

  if (!queryParams.success) {
    throw new Error(queryParams.error.message);
  }

  const stats = await getCategoriesStats(
    user.id,
    queryParams.data.from,
    queryParams.data.to
  );
  return Response.json(stats);
}

export type GetCategoriesStatsResponse = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  // First, get all transactions for the period
  const transactions = await prisma.transaction.findMany({
    where: {
      userId,
      date: {
        gte: from,
        lte: to,
      },
    },
    select: {
      type: true,
      category: true,
      amount: true,
    },
  });

  // Group transactions by type and category
  const groupedStats = transactions.reduce(
    (acc, transaction) => {
      const key = `${transaction.type}-${transaction.category}`;
      if (!acc[key]) {
        acc[key] = {
          type: transaction.type,
          category: transaction.category,
          amount: 0,
        };
      }
      acc[key].amount += transaction.amount;
      return acc;
    },
    {} as Record<string, { type: string; category: string; amount: number }>
  );

  // Convert to array and sort by amount
  return Object.values(groupedStats).sort((a, b) => b.amount - a.amount);
}
