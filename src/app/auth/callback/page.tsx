"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

// Google (and email-confirmation) links land here. supabase-js exchanges
// the code in the URL automatically; we just wait for the session.
export default function AuthCallbackPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, loading, router]);

  return (
    <main className="min-h-screen bg-bg flex items-center justify-center">
      <p className="text-textSecondary text-sm">Signing you in…</p>
    </main>
  );
}
