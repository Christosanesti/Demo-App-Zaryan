import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { currentUser } from "@clerk/nextjs/server";
import { db } from "@/lib/db";

const createCustomerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  address: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  photoUrl: z.string().url("Invalid photo URL").optional().or(z.literal("")),
  guarantorName: z.string().optional().or(z.literal("")),
  guarantorPhone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional()
    .or(z.literal("")),
  guarantorAddress: z
    .string()
    .min(5, "Address must be at least 5 characters")
    .optional()
    .or(z.literal("")),
  documentsUrl: z
    .string()
    .url("Invalid documents URL")
    .optional()
    .or(z.literal("")),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createCustomerSchema.parse(body);

    const customer = await prisma.customer.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone || null,
        address: validatedData.address || null,
        photoUrl: validatedData.photoUrl || null,
        guarantorName: validatedData.guarantorName || null,
        guarantorPhone: validatedData.guarantorPhone || null,
        guarantorAddress: validatedData.guarantorAddress || null,
        documentsUrl: validatedData.documentsUrl || null,
        userName: user.username || "User",
        user: {
          connect: {
            id: user.id,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("Error creating customer:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const user = await currentUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customers = await db.customer.findMany({
      where: {
        userId: user.id,
      },
      include: {
        sales: {
          select: {
            id: true,
            totalAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.error("[CUSTOMERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    const validatedData = createCustomerSchema.partial().parse(data);

    const customer = await prisma.customer.update({
      where: { id, userId: user.id },
      data: validatedData,
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.error("[CUSTOMER_PATCH]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse(
        JSON.stringify({ error: "Validation error", details: error.errors }),
        { status: 400 }
      );
    }
    return new NextResponse(
      JSON.stringify({ error: "Failed to update customer" }),
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return new NextResponse("ID is required", { status: 400 });
    }

    await prisma.customer.delete({
      where: { id, userId: user.id },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[CUSTOMER_DELETE]", error);
    return new NextResponse(
      JSON.stringify({ error: "Failed to delete customer" }),
      { status: 500 }
    );
  }
}
