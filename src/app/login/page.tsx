"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@/context/AuthContext";
import { isSupabaseConfigured } from "@/lib/supabase/client";
import RoleSelect from "@/components/RoleSelect";

function LoginForm() {
  const searchParams = useSearchParams();
  const initialMode = searchParams.get("mode") === "signup" ? "signup" : "login";

  const [mode, setMode] = useState<"login" | "signup">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const { user, loading, loginWithPassword, signupWithPassword, loginWithGoogle } = useAuth();
  const router = useRouter();

  // already signed in -> skip the login page
  useEffect(() => {
    if (!loading && user) router.replace("/dashboard");
  }, [user, loading, router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setSubmitting(true);

    if (mode === "login") {
      const { error } = await loginWithPassword(email, password);
      if (error) setError(error);
      else router.push("/dashboard");
    } else {
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        setSubmitting(false);
        return;
      }
      const result = await signupWithPassword({ name, email, password, targetRole });
      if (result.error) setError(result.error);
      else if (result.needsEmailConfirmation)
        setInfo("Account created. Check your email and click the confirmation link to continue.");
      else router.push("/dashboard");
    }
    setSubmitting(false);
  }

  async function handleGoogle() {
    setError(null);
    const { error } = await loginWithGoogle();
    if (error) setError(error);
    // on success the browser is redirected to Google
  }

  const inputClass =
    "border border-line rounded-card px-4 py-2 text-sm bg-bg text-textPrimary placeholder:text-textSecondary";

  return (
    <main className="min-h-screen flex flex-col bg-bg">
      <header className="border-b border-line bg-gold">
        <div className="container-x flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.png" alt="CareerRole logo" width={48} height={48} />
            <span className="font-display text-3xl font-bold text-textPrimary">CareerRole</span>
          </Link>
          <Link href="/" className="text-sm font-semibold text-bg hover:text-maroon">
            ← Back to home
          </Link>
        </div>
      </header>
      <div
        className="flex-1 flex items-center justify-center px-6 py-10"
        style={{
          backgroundImage: "radial-gradient(#3A3730 2px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="w-full max-w-md border border-line rounded-card p-10 bg-surface shadow-sm">
          <div className="flex justify-center gap-8 mb-8 border-b border-line">
            {(["login", "signup"] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMode(m);
                  setError(null);
                  setInfo(null);
                }}
                className={`pb-3 font-display text-xl font-semibold ${
                  mode === m ? "text-textPrimary border-b-2 border-gold" : "text-textSecondary"
                }`}
              >
                {m === "login" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {!isSupabaseConfigured && (
            <p className="text-xs text-red-400 mb-4">
              Supabase keys are missing. Copy .env.example to .env.local and fill them in.
            </p>
          )}

          <button
            type="button"
            onClick={handleGoogle}
            className="w-full flex items-center justify-center gap-3 border border-line rounded-card px-4 py-2 text-sm font-medium bg-bg text-textPrimary hover:bg-line transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
              <path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.9 2.4 30.4 0 24 0 14.6 0 6.5 5.4 2.6 13.2l7.9 6.1C12.4 13.6 17.7 9.5 24 9.5z" />
              <path fill="#4285F4" d="M46.1 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.4c-.5 2.9-2.2 5.3-4.6 6.9l7.4 5.7c4.3-4 6.9-9.9 6.9-17.1z" />
              <path fill="#FBBC05" d="M10.5 28.7c-.5-1.4-.8-2.9-.8-4.7s.3-3.2.8-4.7l-7.9-6.1C.9 16.4 0 20.1 0 24s.9 7.6 2.6 10.8l7.9-6.1z" />
              <path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.4-5.7c-2.1 1.4-4.8 2.3-8.5 2.3-6.3 0-11.6-4.1-13.5-9.8l-7.9 6.1C6.5 42.6 14.6 48 24 48z" />
            </svg>
            Continue with Google
          </button>

          <div className="flex items-center gap-3 my-5">
            <span className="flex-1 h-px bg-line" />
            <span className="text-xs text-textSecondary">or use email</span>
            <span className="flex-1 h-px bg-line" />
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {mode === "signup" && (
              <input
                type="text"
                placeholder="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            )}
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className={inputClass}
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={inputClass}
            />
            {mode === "signup" && <RoleSelect value={targetRole} onChange={setTargetRole} />}

            {error && <p className="text-sm text-red-400">{error}</p>}
            {info && <p className="text-sm text-gold">{info}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="rounded-card px-4 py-2 text-sm font-medium bg-gold mt-2 text-goldText disabled:opacity-60"
            >
              {submitting ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}

// useSearchParams needs a Suspense boundary for production builds
export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
