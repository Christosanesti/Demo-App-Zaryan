import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const updateEntrySchema = z.object({
  date: z.string().optional(),
  type: z.enum(["income", "expense"]).optional(),
  amount: z.number().positive().optional(),
  description: z.string().min(1).optional(),
  reference: z.string().min(1).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: { entryId: string } }
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
        id: params.entryId,
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

export async function DELETE(
  req: Request,
  { params }: { params: { entryId: string } }
) {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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
