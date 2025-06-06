import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const entrySchema = z.object({
  date: z.date({
    required_error: "Date is required",
  }),
  type: z.enum(["income", "expense"], {
    required_error: "Type is required",
  }),
  amount: z
    .number({
      required_error: "Amount is required",
      invalid_type_error: "Amount must be a number",
    })
    .positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().min(1, "Reference is required"),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank", "mobile"], {
    required_error: "Payment method is required",
  }),
  status: z.enum(["completed", "pending", "cancelled"], {
    required_error: "Status is required",
  }),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const type = searchParams.get("type");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortBy = searchParams.get("sortBy") || "date";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {
      userId: user.id,
    };

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    if (type) where.type = type;
    if (category) where.category = category;
    if (status) where.status = status;

    if (search) {
      where.OR = [
        { description: { contains: search, mode: "insensitive" } },
        { reference: { contains: search, mode: "insensitive" } },
        { notes: { contains: search, mode: "insensitive" } },
      ];
    }

    const [entries, total] = await Promise.all([
      prisma.daybookEntry.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: true,
          sale: true,
          installment: true,
          stock: true,
          purchase: true,
        },
      }),
      prisma.daybookEntry.count({ where }),
    ]);

    const summary = await prisma.daybookEntry.groupBy({
      by: ["type"],
      where,
      _sum: {
        amount: true,
      },
    });

    const income = summary.find((s) => s.type === "income")?._sum.amount || 0;
    const expense = summary.find((s) => s.type === "expense")?._sum.amount || 0;

    return NextResponse.json({
      entries: entries.map((entry) => ({
        ...entry,
        attachments: entry.attachments ? JSON.parse(entry.attachments) : [],
      })),
      summary: {
        income,
        expense,
        balance: income - expense,
      },
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        limit,
      },
    });
  } catch (error) {
    console.error("[DAYBOOK_GET]", error);
    return NextResponse.json(
      {
        error: "Failed to fetch entries",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = entrySchema.parse(body);

    // Check for duplicate reference
    const existingEntry = await prisma.daybookEntry.findFirst({
      where: {
        userId: user.id,
        reference: validatedData.reference,
      },
    });

    if (existingEntry) {
      return NextResponse.json(
        { error: "Reference already exists" },
        { status: 400 }
      );
    }

    const entry = await prisma.daybookEntry.create({
      data: {
        ...validatedData,
        userId: user.id,
        userName:
          user.firstName || user.emailAddresses[0]?.emailAddress || "User",
        attachments: JSON.stringify(validatedData.attachments || []),
      },
      include: {
        customer: true,
        sale: true,
        installment: true,
        stock: true,
        purchase: true,
      },
    });

    return NextResponse.json(
      {
        ...entry,
        attachments: validatedData.attachments || [],
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[DAYBOOK_POST]", error);
    return NextResponse.json(
      {
        error: "Failed to create entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validatedData = entrySchema.partial().parse(body);

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.daybookEntry.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    // If reference is being updated, check for duplicates
    if (
      validatedData.reference &&
      validatedData.reference !== existingEntry.reference
    ) {
      const duplicateReference = await prisma.daybookEntry.findFirst({
        where: {
          userId: user.id,
          reference: validatedData.reference,
          id: { not: id },
        },
      });

      if (duplicateReference) {
        return NextResponse.json(
          { error: "Reference already exists" },
          { status: 400 }
        );
      }
    }

    const entry = await prisma.daybookEntry.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...validatedData,
        attachments:
          validatedData.attachments ?
            JSON.stringify(validatedData.attachments)
          : undefined,
      },
      include: {
        customer: true,
        sale: true,
        installment: true,
        stock: true,
        purchase: true,
      },
    });

    return NextResponse.json({
      ...entry,
      attachments: entry.attachments ? JSON.parse(entry.attachments) : [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation failed", details: error.errors },
        { status: 400 }
      );
    }
    console.error("[DAYBOOK_PATCH]", error);
    return NextResponse.json(
      {
        error: "Failed to update entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json(
        { error: "Entry ID is required" },
        { status: 400 }
      );
    }

    // Check if entry exists and belongs to user
    const existingEntry = await prisma.daybookEntry.findUnique({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!existingEntry) {
      return NextResponse.json({ error: "Entry not found" }, { status: 404 });
    }

    await prisma.daybookEntry.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ success: true }, { status: 204 });
  } catch (error) {
    console.error("[DAYBOOK_DELETE]", error);
    return NextResponse.json(
      {
        error: "Failed to delete entry",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
