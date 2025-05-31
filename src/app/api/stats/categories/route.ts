import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const from = searchParams.get("from");
  const to = searchParams.get("to");

  const querySchema = z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
  });

  const queryValidation = querySchema.safeParse({
    from,
    to,
  });

  if (!queryValidation.success) {
    return Response.json(queryValidation.error.message, {
      status: 400,
    });
  }

  const stats = await getCategoriesStats(
    user.id,
    queryValidation.data.from,
    queryValidation.data.to
  );
  return Response.json(stats);
}

export type GetCategoriesStatsResponse = Awaited<
  ReturnType<typeof getCategoriesStats>
>;

async function getCategoriesStats(userId: string, from: Date, to: Date) {
  // Get all daybook entries for the period
  const entries = await prisma.daybookEntry.findMany({
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

  // Group entries by type and category
  const groupedStats = entries.reduce(
    (acc, entry) => {
      const category = entry.category || "Uncategorized";
      const key = `${entry.type}-${category}`;
      if (!acc[key]) {
        acc[key] = {
          type: entry.type,
          category: category,
          amount: 0,
        };
      }
      acc[key].amount += entry.amount;
      return acc;
    },
    {} as Record<string, { type: string; category: string; amount: number }>
  );

  // Convert to array and sort by amount
  return Object.values(groupedStats).sort((a, b) => b.amount - a.amount);
}
