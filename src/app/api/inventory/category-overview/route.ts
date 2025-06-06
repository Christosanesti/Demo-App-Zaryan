import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const CategoryOverviewSchema = z.array(
  z.object({
    category: z.string(),
    itemCount: z.number(),
    totalValue: z.number(),
  })
);

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inventory = await prisma.inventory.findMany({
    where: { userId: user.id },
    select: { category: true, quantity: true, price: true },
  });

  const categoryMap: Record<string, { itemCount: number; totalValue: number }> =
    {};
  for (const item of inventory) {
    if (!categoryMap[item.category]) {
      categoryMap[item.category] = { itemCount: 0, totalValue: 0 };
    }
    categoryMap[item.category].itemCount += 1;
    categoryMap[item.category].totalValue += item.price * item.quantity;
  }

  const result = Object.entries(categoryMap).map(([category, data]) => ({
    category,
    itemCount: data.itemCount,
    totalValue: data.totalValue,
  }));

  return NextResponse.json(CategoryOverviewSchema.parse(result));
}
