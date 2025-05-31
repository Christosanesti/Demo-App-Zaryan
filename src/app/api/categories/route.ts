import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    redirect("/sign-in");
  }

  const { searchParams } = new URL(request.url);
  const paramType = searchParams.get("type");

  const validator = z.enum(["income", "expense"]).nullable();

  const queryParams = validator.safeParse(paramType);
  if (!queryParams.success) {
    return Response.json(queryParams.error, {
      status: 400,
    });
  }

  const type = queryParams.data;

  // Get unique categories from DaybookEntry
  const daybookCategories = await prisma.daybookEntry.findMany({
    where: {
      userId: user.id,
      category: {
        not: null,
      },
      ...(type && { type }),
    },
    select: {
      category: true,
    },
    distinct: ["category"],
  });

  // Get unique categories from LedgerEntry
  const ledgerCategories = await prisma.ledgerEntry.findMany({
    where: {
      userId: user.id,
      category: {
        not: null,
      },
    },
    select: {
      category: true,
    },
    distinct: ["category"],
  });

  // Combine and deduplicate categories
  const allCategories = [
    ...daybookCategories.map((entry) => entry.category),
    ...ledgerCategories.map((entry) => entry.category),
  ].filter(
    (category, index, array) => category && array.indexOf(category) === index
  );

  // Format as objects with name property for consistency
  const categories = allCategories.map((name) => ({
    id: name,
    name,
    type: type || "general",
    userId: user.id,
  }));

  return Response.json(categories);
}
