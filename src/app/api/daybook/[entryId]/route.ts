import { NextResponse } from "next/server";
import { getAuthUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const { user } = await getAuthUser();
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

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error("[DAYBOOK_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const { user } = await getAuthUser();
    const params = await context.params;

    const body = await req.json();
    const {
      date,
      type,
      amount,
      description,
      reference,
      category,
      paymentMethod,
      status,
      attachments,
      notes,
    } = body;

    if (!date || !type || !amount) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const entry = await prisma.daybookEntry.update({
      where: {
        id: params.entryId,
        userId: user.id,
      },
      data: {
        date: new Date(date),
        type,
        amount,
        description,
        reference,
        category,
        paymentMethod,
        status,
        attachments,
        notes,
      },
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error("[DAYBOOK_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  context: { params: Promise<{ entryId: string }> }
) {
  try {
    const { user } = await getAuthUser();
    const params = await context.params;

    await prisma.daybookEntry.delete({
      where: {
        id: params.entryId,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error("[DAYBOOK_DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
