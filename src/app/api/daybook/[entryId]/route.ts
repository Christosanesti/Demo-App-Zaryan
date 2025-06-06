import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const entrySchema = z.object({
  date: z.date().optional(),
  type: z.enum(["income", "expense"]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  reference: z.string().min(1).optional(),
  category: z.string().optional(),
  paymentMethod: z.enum(["cash", "bank", "mobile"]).optional(),
  status: z.enum(["completed", "pending", "cancelled"]).optional(),
  attachments: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function GET(
  req: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await context.params;
    const entry = await prisma.daybookEntry.findUnique({
      where: {
        id: params.entryId,
        userId: user.id,
      },
    });
    if (!entry) {
      return new NextResponse("Not found", { status: 404 });
    }
    return NextResponse.json({
      ...entry,
      attachments: entry.attachments ? JSON.parse(entry.attachments) : [],
    });
  } catch (error) {
    console.error("[DAYBOOK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await context.params;
    const body = await req.json();
    const validatedData = entrySchema.partial().parse(body);
    const entry = await prisma.daybookEntry.update({
      where: {
        id: params.entryId,
        userId: user.id,
      },
      data: {
        ...validatedData,
        attachments:
          validatedData.attachments ?
            JSON.stringify(validatedData.attachments)
          : undefined,
      },
    });
    return NextResponse.json({
      ...entry,
      attachments: entry.attachments ? JSON.parse(entry.attachments) : [],
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    console.error("[DAYBOOK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }
    const params = await context.params;
    await prisma.daybookEntry.delete({
      where: {
        id: params.entryId,
        userId: user.id,
      },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DAYBOOK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
