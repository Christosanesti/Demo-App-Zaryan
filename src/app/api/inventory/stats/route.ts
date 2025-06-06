import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const InventoryStatsSchema = z.object({
  totalItems: z.number(),
  totalValue: z.number(),
  inStockCount: z.number(),
  outOfStockCount: z.number(),
  lowStockCount: z.number(),
});

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const inventory = await prisma.inventory.findMany({
    where: { userId: user.id },
    select: { quantity: true, price: true, minStock: true },
  });

  const totalItems = inventory.length;
  const totalValue = inventory.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const inStockCount = inventory.filter((item) => item.quantity > 0).length;
  const outOfStockCount = inventory.filter(
    (item) => item.quantity === 0
  ).length;
  const lowStockCount = inventory.filter(
    (item) => item.quantity <= (item.minStock ?? 0)
  ).length;

  const result = InventoryStatsSchema.parse({
    totalItems,
    totalValue,
    inStockCount,
    outOfStockCount,
    lowStockCount,
  });

  return NextResponse.json(result);
}
