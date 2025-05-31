import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { z } from "zod";

const createStaffSchema = z.object({
  name: z.string().min(1),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  position: z.string().min(1),
  department: z.string().min(1),
  salary: z.number().positive(),
  joiningDate: z.string(),
  status: z.enum(["active", "inactive", "on_leave"]),
  documents: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const validatedData = createStaffSchema.parse(body);

    const staff = await prisma.staff.create({
      data: {
        ...validatedData,
        userId: user.id,
        joiningDate: new Date(validatedData.joiningDate),
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_POST]", error);
    if (error instanceof z.ZodError) {
      return new NextResponse("Invalid request data", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const status = searchParams.get("status");
    const search = searchParams.get("search");

    const where = {
      userId: user.id,
      ...(department && { department }),
      ...(status && { status }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { phone: { contains: search, mode: "insensitive" as const } },
        ],
      }),
    };

    const staff = await prisma.staff.findMany({
      where,
      orderBy: {
        name: "asc",
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
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

    const staff = await prisma.staff.update({
      where: {
        id,
        userId: user.id,
      },
      data: {
        ...data,
        joiningDate: data.joiningDate ? new Date(data.joiningDate) : undefined,
      },
    });

    return NextResponse.json(staff);
  } catch (error) {
    console.error("[STAFF_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
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

    await prisma.staff.delete({
      where: {
        id,
        userId: user.id,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[STAFF_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
