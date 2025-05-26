"use server";

import { redirect } from "next/navigation";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "../../../../schema/transaction";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { DateToUTCDate } from "@/lib/helpers";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error(parsedBody.error.message);
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { amount, category, date, description, type } = parsedBody.data;

  // Check if the category is a bank or ledger
  const isBankOrLedger =
    category.toLowerCase().includes("bank") ||
    category.toLowerCase().includes("ledger");

  let categoryRow = await prisma.category.findFirst({
    where: {
      userId: user.id,
      name: category,
    },
  });

  // If category doesn't exist and it's a bank or ledger, create it
  if (!categoryRow && isBankOrLedger) {
    categoryRow = await prisma.category.create({
      data: {
        userId: user.id,
        name: category,
        type: type,
        icon: type === "income" ? "arrow-up" : "arrow-down",
      },
    });
  } else if (!categoryRow) {
    throw new Error("Category not found");
  }

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        userId: user.id,
        amount,
        date,
        description,
        type,
        category: categoryRow.name,
        categoryIcon: categoryRow.icon,
      },
    }),
    prisma.monthHistory.upsert({
      where: {
        day_month_year_userId: {
          userId: user.id,
          day: date.getUTCDate(),
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        day: date.getUTCDate(),
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),

    prisma.yearHistory.upsert({
      where: {
        month_year_userId: {
          userId: user.id,
          month: date.getUTCMonth(),
          year: date.getUTCFullYear(),
        },
      },
      create: {
        userId: user.id,
        month: date.getUTCMonth(),
        year: date.getUTCFullYear(),
        expense: type === "expense" ? amount : 0,
        income: type === "income" ? amount : 0,
      },
      update: {
        expense: {
          increment: type === "expense" ? amount : 0,
        },
        income: {
          increment: type === "income" ? amount : 0,
        },
      },
    }),
  ]);
}
