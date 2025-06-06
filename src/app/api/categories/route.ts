import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const defaultCategories = {
  income: [
    "Salary",
    "Business Income",
    "Investment",
    "Rental Income",
    "Other Income",
  ],
  expense: [
    "Food & Dining",
    "Transportation",
    "Housing",
    "Utilities",
    "Entertainment",
    "Healthcare",
    "Shopping",
    "Education",
    "Travel",
    "Other Expense",
  ],
};

const createCategorySchema = z.object({
  name: z.string().min(1, "Category name is required"),
  type: z.enum(["income", "expense"]),
});

export async function GET(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const paramType = searchParams.get("type");

    const validator = z.enum(["income", "expense"]).nullable();
    const queryParams = validator.safeParse(paramType);

    if (!queryParams.success) {
      return NextResponse.json(
        { error: "Invalid type parameter" },
        { status: 400 }
      );
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

    // Add default categories if type is specified
    const defaultCats = type ? defaultCategories[type] : [];
    const combinedCategories = [...new Set([...allCategories, ...defaultCats])];

    // Format as objects with name property for consistency
    const categories = combinedCategories.map((name) => ({
      id: name,
      name,
      type: type || "general",
      userId: user.id,
    }));

    return NextResponse.json(categories);
  } catch (error) {
    console.error("[CATEGORIES_GET]", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = createCategorySchema.parse(body);

    // Check if category already exists
    const existingCategory = await prisma.daybookEntry.findFirst({
      where: {
        userId: user.id,
        category: validatedData.name,
        type: validatedData.type,
      },
    });

    if (existingCategory) {
      return NextResponse.json(
        { error: "Category already exists" },
        { status: 400 }
      );
    }

    // Create a new daybook entry with the category to persist it
    await prisma.daybookEntry.create({
      data: {
        userId: user.id,
        userName:
          user.firstName || user.emailAddresses[0]?.emailAddress || "User",
        date: new Date(),
        type: validatedData.type,
        amount: 0,
        description: "Category creation",
        reference: `cat-${Date.now()}`,
        category: validatedData.name,
        paymentMethod: "cash",
        status: "completed",
      },
    });

    return NextResponse.json(
      {
        id: validatedData.name,
        name: validatedData.name,
        type: validatedData.type,
        userId: user.id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CATEGORIES_POST]", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
