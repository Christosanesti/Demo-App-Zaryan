import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    redirect("sign-in");
  }

  const periods = await getHistoryPeriods(user.id);
  return Response.json(periods);
}

export type getHistoryPeriodsResponse = Awaited<
  ReturnType<typeof getHistoryPeriods>
>;

async function getHistoryPeriods(userId: string) {
  const result = await prisma.daybookEntry.findMany({
    where: {
      userId,
    },
    select: {
      date: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Extract unique years from the dates
  const years = Array.from(
    new Set(result.map((item) => item.date.getFullYear()))
  ).sort((a, b) => a - b);

  if (years.length === 0) {
    return [new Date().getFullYear()];
  }
  return years;
}
