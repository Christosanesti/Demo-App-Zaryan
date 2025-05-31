"use server";

import { redirect } from "next/navigation";
import {
  CreateTransactionSchema,
  CreateTransactionSchemaType,
} from "../../../../schema/transaction";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { DateToUTCDate } from "@/lib/helpers";

export async function CreateTransaction(form: CreateTransactionSchemaType) {
  const parsedBody = CreateTransactionSchema.safeParse(form);

  if (!parsedBody.success) {
    throw new Error("bad request");
  }

  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const { amount, category, date, description, type } = parsedBody.data;

  // Create a daybook entry instead of using non-existent models
  await prisma.daybookEntry.create({
    data: {
      userId: user.id,
      userName: user.firstName || "User",
      amount,
      date,
      description: description || `${type} transaction`,
      type,
      category,
      reference: `${type}-${Date.now()}`, // Generate a reference
      status: "completed",
    },
  });
}
