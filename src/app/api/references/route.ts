import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";

const CreateReferenceSchema = z.object({
  name: z.string().min(1),
  type: z.enum(["ledger", "bank", "customer"]),
});

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const references = await prisma.reference.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(references.map((ref) => ref.name));
  } catch (error) {
    console.error("[REFERENCES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = CreateReferenceSchema.parse(body);

    const reference = await prisma.reference.create({
      data: {
        ...validatedData,
        userId: user.id,
      },
    });

    return NextResponse.json(reference);
  } catch (error) {
    console.error("[REFERENCES_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal Error", { status: 500 });
  }
}
