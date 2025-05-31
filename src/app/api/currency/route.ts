import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { DEFAULT_CURRENCY } from "@/schema/currency";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const userSettings = await prisma.userSettings.findUnique({
      where: {
        userId: user.id,
      },
    });

    if (!userSettings) {
      // Create default settings if they don't exist
      const newSettings = await prisma.userSettings.create({
        data: {
          userId: user.id,
          currency: DEFAULT_CURRENCY,
        },
      });
      return NextResponse.json(newSettings);
    }

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("[CURRENCY_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST() {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Always set to USD as it's the only allowed currency
    const userSettings = await prisma.userSettings.upsert({
      where: {
        userId: user.id,
      },
      update: {
        currency: DEFAULT_CURRENCY,
      },
      create: {
        userId: user.id,
        currency: DEFAULT_CURRENCY,
      },
    });

    return NextResponse.json(userSettings);
  } catch (error) {
    console.error("[CURRENCY_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
