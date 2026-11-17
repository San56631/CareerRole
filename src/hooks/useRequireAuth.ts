"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Returns the signed-in user (or null while loading / redirecting).
// Waits for the session check to finish before redirecting, so a refresh
// no longer bounces a logged-in user to /login.
export function useRequireAuth() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  return user;
}
