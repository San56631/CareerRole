"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

export type User = {
  id: string;
  name: string;
  email: string;
  targetRole: string;
  avatarUrl: string | null;
};

type AuthResult = { error: string | null; needsEmailConfirmation?: boolean };

type AuthContextType = {
  user: User | null;
  loading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AuthResult>;
  signupWithPassword: (input: {
    name: string;
    email: string;
    password: string;
    targetRole: string;
  }) => Promise<AuthResult>;
  loginWithGoogle: () => Promise<AuthResult>;
  updateProfile: (changes: { name?: string; targetRole?: string }) => Promise<AuthResult>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function toAppUser(raw: SupabaseUser): User {
  const meta = raw.user_metadata ?? {};
  return {
    id: raw.id,
    email: raw.email ?? "",
    // Google supplies full_name / name; email signup supplies name
    name: meta.name || meta.full_name || (raw.email ? raw.email.split("@")[0] : "Student"),
    targetRole: meta.targetRole || "Software Engineer",
    avatarUrl: meta.avatar_url || meta.picture || null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session ? toAppUser(data.session.user) : null);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session ? toAppUser(session.user) : null);
      setLoading(false);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const loginWithPassword: AuthContextType["loginWithPassword"] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error: error ? error.message : null };
  };

  const signupWithPassword: AuthContextType["signupWithPassword"] = async ({
    name,
    email,
    password,
    targetRole,
  }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name, targetRole },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) return { error: error.message };
    // If email confirmation is on in Supabase, there is no session yet
    return { error: null, needsEmailConfirmation: !data.session };
  };

  const loginWithGoogle: AuthContextType["loginWithGoogle"] = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    return { error: error ? error.message : null };
  };

  const updateProfile: AuthContextType["updateProfile"] = async (changes) => {
    const { data, error } = await supabase.auth.updateUser({ data: changes });
    if (error) return { error: error.message };
    if (data.user) setUser(toAppUser(data.user));
    return { error: null };
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, loginWithPassword, signupWithPassword, loginWithGoogle, updateProfile, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside an AuthProvider");
  }
  return context;
}
