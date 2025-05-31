import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { z } from "zod";

const userSettingsSchema = z.object({
  id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  userId: z.string(),
  currency: z.string(),
});

export type UserSettings = z.infer<typeof userSettingsSchema>;

/**
 * Ensures the current user exists in the database and returns both Clerk user and DB user
 * Redirects to sign-in if not authenticated
 * Returns only serializable data to prevent Next.js serialization errors
 */
export async function getCurrentUserWithDB() {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      settings: true,
    },
  });

  if (!dbUser) {
    return null;
  }

  return {
    ...dbUser,
    settings:
      dbUser.settings ? userSettingsSchema.parse(dbUser.settings) : null,
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

  const dbUser = await db.user.findUnique({
    where: { id: user.id },
    include: {
      settings: true,
    },
  });

  if (!dbUser) {
    const newUser = await db.user.create({
      data: {
        id: user.id,
        settings: {
          create: {
            currency: "USD",
          },
        },
      },
      include: {
        settings: true,
      },
    });
    return {
      ...newUser,
      settings: userSettingsSchema.parse(newUser.settings),
    };
  }

  return {
    ...dbUser,
    settings:
      dbUser.settings ? userSettingsSchema.parse(dbUser.settings) : null,
  };
}

/**
 * Simple function to get current user from Clerk for API routes
 * Returns null if not authenticated (doesn't redirect for API routes)
 */
export async function getCurrentUser() {
  const user = await ensureUserInDB();

  if (!user) {
    redirect("/sign-in");
  }

  // Ensure userSettings exists
  if (!user.settings) {
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        settings: {
          create: {
            currency: "USD",
          },
        },
      },
      include: {
        settings: true,
      },
    });
    return {
      ...updatedUser,
      settings: userSettingsSchema.parse(updatedUser.settings),
    };
  }

  return user;
}
