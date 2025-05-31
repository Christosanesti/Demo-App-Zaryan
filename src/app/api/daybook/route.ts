import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

const entrySchema = z.object({
  date: z.string(),
  type: z.enum(["income", "expense"]),
  amount: z.number().positive(),
  description: z.string().min(1),
  reference: z.string().min(1),
});

const updateEntrySchema = entrySchema.partial();

// GET /api/daybook
export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const entries = await prisma.daybookEntry.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        date: "desc",
      },
    });

    return NextResponse.json(entries);
  } catch (error) {
    console.error("[DAYBOOK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// POST /api/daybook
export async function POST(req: Request) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = entrySchema.parse(body);

    const entry = await prisma.daybookEntry.create({
      data: {
        ...validatedData,
        userId: user.id,
        userName: user.firstName || "User",
      },
    });

    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    console.error("[DAYBOOK_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// PATCH /api/daybook/:id
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateEntrySchema.parse(body);

    const entry = await prisma.daybookEntry.update({
      where: {
        id: params.id,
        userId: user.id,
      },
      data: validatedData,
    });

    return NextResponse.json(entry);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }

    console.error("[DAYBOOK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

// DELETE /api/daybook/:id
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    await prisma.daybookEntry.delete({
      where: {
        id: params.id,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DAYBOOK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
