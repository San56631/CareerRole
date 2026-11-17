"use client";

import { useEffect, useState } from "react";
import TopNav from "@/components/TopNav";
import RoleSelect from "@/components/RoleSelect";
import { useAuth } from "@/context/AuthContext";
import { useRequireAuth } from "@/hooks/useRequireAuth";

export default function ProfilePage() {
  const user = useRequireAuth();
  const { updateProfile } = useAuth();
  const [name, setName] = useState("");
  const [targetRole, setTargetRole] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "error"; text: string } | null>(null);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setTargetRole(user.targetRole);
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    const { error } = await updateProfile({ name: name.trim(), targetRole });
    setSaving(false);
    setMessage(error ? { type: "error", text: error } : { type: "ok", text: "Profile updated." });
  }

  const inputClass =
    "border border-line rounded-card px-4 py-2 text-sm bg-bg text-textPrimary w-full";

  return (
    <main className="min-h-screen bg-bg">
      <TopNav />
      <div className="container-x py-12 max-w-xl">
        <h1 className="font-display text-3xl text-textPrimary mb-8">My profile</h1>

        {!user ? (
          <p className="text-textSecondary text-sm">Loading…</p>
        ) : (
          <form
            onSubmit={handleSave}
            className="border border-line rounded-card p-8 bg-surface flex flex-col gap-5"
          >
            <div className="flex items-center gap-4">
              {user.avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={user.avatarUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <span className="w-16 h-16 rounded-full bg-gold text-goldText flex items-center justify-center text-2xl font-display font-semibold">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              )}
              <div>
                <p className="text-textPrimary font-semibold">{user.name}</p>
                <p className="text-xs text-textSecondary">{user.email}</p>
              </div>
            </div>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-textSecondary">Full name</span>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
              />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-textSecondary">Email</span>
              <input type="email" value={user.email} disabled className={`${inputClass} opacity-60`} />
            </label>

            <label className="flex flex-col gap-1">
              <span className="text-xs text-textSecondary">Target career role</span>
              <RoleSelect value={targetRole} onChange={setTargetRole} />
            </label>

            {message && (
              <p className={`text-sm ${message.type === "ok" ? "text-gold" : "text-red-400"}`}>
                {message.text}
              </p>
            )}

            <button
              type="submit"
              disabled={saving}
              className="rounded-card px-4 py-2 text-sm font-medium bg-gold text-goldText disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save changes"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
