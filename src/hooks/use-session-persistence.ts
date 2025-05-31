"use client";

import { useAuth, useSession } from "@clerk/nextjs";
import { useEffect, useCallback } from "react";

export function useSessionPersistence() {
  const { isLoaded, isSignedIn, sessionId } = useAuth();
  const { session } = useSession();

  const touchSession = useCallback(async () => {
    if (session && isSignedIn) {
      try {
        // Touch the session to keep it alive
        await session.touch();
      } catch (error) {
        console.error("Failed to touch session:", error);
      }
    }
  }, [session, isSignedIn]);

  const refreshSession = useCallback(async () => {
    if (session && isSignedIn) {
      try {
        // Refresh the session token
        await session.getToken({
          template: "default",
          leewayInSeconds: 60,
        });
      } catch (error) {
        console.error("Failed to refresh session token:", error);
      }
    }
  }, [session, isSignedIn]);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !session) return;

    // Touch session every 5 minutes to keep it alive
    const touchInterval = setInterval(touchSession, 5 * 60 * 1000);

    // Refresh session token every 30 minutes
    const refreshInterval = setInterval(refreshSession, 30 * 60 * 1000);

    // Touch session on page focus
    const handleFocus = () => {
      touchSession();
    };

    // Touch session on user activity
    const handleActivity = () => {
      touchSession();
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("click", handleActivity);
    window.addEventListener("keydown", handleActivity);
    window.addEventListener("scroll", handleActivity);

    return () => {
      clearInterval(touchInterval);
      clearInterval(refreshInterval);
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("click", handleActivity);
      window.removeEventListener("keydown", handleActivity);
      window.removeEventListener("scroll", handleActivity);
    };
  }, [isLoaded, isSignedIn, session, touchSession, refreshSession]);

  return {
    isLoaded,
    isSignedIn,
    sessionId,
    touchSession,
    refreshSession,
  };
}
