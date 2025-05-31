import { auth } from "@clerk/nextjs";
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
  const { userId } = auth();

  if (!userId) {
    return null;
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
    },
  });

  return user;
}

/**
 * Simple version that just ensures user exists in DB
 * Returns only serializable data to prevent Next.js serialization errors
 */
export async function ensureUserInDB() {
  const { userId } = auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const user = await db.user.findUnique({
    where: { id: userId },
    include: {
      settings: true,
    },
  });

  if (!user) {
    const newUser = await db.user.create({
      data: {
        id: userId,
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
    return newUser;
  }

  return user;
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
    return updatedUser;
  }

  // Validate userSettings with Zod
  const validatedSettings = userSettingsSchema.safeParse(user.settings);

  if (!validatedSettings.success) {
    // If settings are invalid, create new ones
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
    return updatedUser;
  }

  return {
    ...user,
    settings: validatedSettings.data,
  };
}
