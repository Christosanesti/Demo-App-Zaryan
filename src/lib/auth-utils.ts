import { prisma } from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

/**
 * Ensures the current user exists in the database and returns both Clerk user and DB user
 * Redirects to sign-in if not authenticated
 * Returns only serializable data to prevent Next.js serialization errors
 */
export async function getCurrentUserWithDB() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  // Check if user exists in database
  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
    include: {
      userSettings: true,
    },
  });

  if (!dbUser) {
    // Create the user in the database if they don't exist
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name:
          user.firstName ?
            `${user.firstName} ${user.lastName || ""}`.trim()
          : null,
      },
      include: {
        userSettings: true,
      },
    });
  }

  // Ensure user settings exist
  if (!dbUser.userSettings) {
    await prisma.userSettings.create({
      data: {
        userId: user.id,
        currency: "USD",
      },
    });

    // Refetch user with settings
    dbUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
      include: {
        userSettings: true,
      },
    });
  }

  // Return only serializable data
  return {
    clerkUser: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      emailAddresses: user.emailAddresses.map((email) => ({
        emailAddress: email.emailAddress,
        id: email.id,
      })),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
    },
    dbUser: {
      id: dbUser!.id,
      email: dbUser!.email,
      name: dbUser!.name,
      createdAt: dbUser!.createdAt.toISOString(),
      updatedAt: dbUser!.updatedAt.toISOString(),
    },
    userSettings: {
      id: dbUser!.userSettings!.id,
      userId: dbUser!.userSettings!.userId,
      currency: dbUser!.userSettings!.currency,
      createdAt: dbUser!.userSettings!.createdAt.toISOString(),
      updatedAt: dbUser!.userSettings!.updatedAt.toISOString(),
    },
  };
}

/**
 * Simple version that just ensures user exists in DB
 * Returns only serializable data to prevent Next.js serialization errors
 */
export async function ensureUserInDB() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  let dbUser = await prisma.user.findUnique({
    where: {
      id: user.id,
    },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || "",
        name:
          user.firstName ?
            `${user.firstName} ${user.lastName || ""}`.trim()
          : null,
      },
    });
  }

  // Return only serializable data
  return {
    clerkUser: {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      emailAddresses: user.emailAddresses.map((email) => ({
        emailAddress: email.emailAddress,
        id: email.id,
      })),
      createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : null,
      updatedAt: user.updatedAt ? new Date(user.updatedAt).toISOString() : null,
    },
    dbUser: {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name,
      createdAt: dbUser.createdAt.toISOString(),
      updatedAt: dbUser.updatedAt.toISOString(),
    },
  };
}

/**
 * Simple function to get current user from Clerk for API routes
 * Returns null if not authenticated (doesn't redirect for API routes)
 */
export async function getCurrentUser() {
  const user = await currentUser();
  return user;
}
