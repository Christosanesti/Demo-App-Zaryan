import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function getAuthUser() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Ensure user exists in database
  const dbUser = await prisma.user.upsert({
    where: { id: user.id },
    update: {},
    create: {
      id: user.id,
      email: user.emailAddresses[0]?.emailAddress,
      name: `${user.firstName} ${user.lastName}`.trim(),
    },
  });

  // Get or create user settings
  const userSettings = await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      currency: "USD",
    },
  });

  return {
    user,
    dbUser,
    userSettings,
  };
}

