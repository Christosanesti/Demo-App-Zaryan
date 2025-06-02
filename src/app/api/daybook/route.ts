import { NextResponse } from "next/server";
import { z } from "zod";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const entrySchema = z.object({
  date: z.string().transform((str) => new Date(str)),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().min(1, "Description is required"),
  reference: z.string().min(1, "Reference is required"),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank", "mobileI"]).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).optional(),
  attachments: z.string().optional(),
  notes: z.string().optional(),
});

const updateEntrySchema = entrySchema.partial();

// GET /api/daybook
export async function GET() {
  try {
    const { user } = await getAuthUser();

    const entries = await prisma.daybookEntry.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json({ entries });
  } catch (error) {
    console.error("[DAYBOOK_GET]", error);
    return new NextResponse(
      JSON.stringify({
        message: "Failed to fetch entries",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// POST /api/daybook
export async function POST(req: Request) {
  try {
    const { user } = await getAuthUser();

    const body = await req.json();
    console.log("Received request body:", body);

    const validationResult = entrySchema.safeParse(body);

    if (!validationResult.success) {
      console.error("Validation error:", validationResult.error);
      return new NextResponse(
        JSON.stringify({
          message: "Validation error",
          errors: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const validatedData = validationResult.data;
    console.log("Validated data:", validatedData);

    const entry = await prisma.daybookEntry.create({
      data: {
        ...validatedData,
        userId: user.id,
        userName:
          user.firstName || user.emailAddresses[0]?.emailAddress || "User",
      },
    });

    console.log("Created entry:", entry);
    return NextResponse.json(entry);
  } catch (error) {
    console.error("[DAYBOOK_POST] Error:", error);

    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({
          message: "Validation error",
          details: error.errors,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    return new NextResponse(
      JSON.stringify({
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
