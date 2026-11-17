"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import ProgressBar from "@/components/ProgressBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { listRoadmaps, progressOf, RoadmapSummary } from "@/lib/roadmaps";
import { formatDate } from "@/lib/resumeHistory";

export default function RoadmapsPage() {
  const user = useRequireAuth();
  const [rows, setRows] = useState<RoadmapSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<"active" | "archived">("active");

  useEffect(() => {
    if (!user) return;
    listRoadmaps().then(({ rows, error }) => {
      setRows(rows);
      setError(error);
    });
  }, [user]);

  const visible = rows?.filter((r) => r.status === tab) ?? [];

  return (
    <main className="min-h-screen bg-bg text-textPrimary">
      <TopNav />
      <div className="container-x py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl">My roadmaps</h1>
          <Link href="/skill-gap" className="bg-gold text-goldText text-sm font-medium rounded-card px-4 py-2">
            New roadmap
          </Link>
        </div>

        <div className="flex gap-6 mb-6 border-b border-line">
          {(["active", "archived"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`pb-2 text-sm capitalize ${
                tab === t ? "text-textPrimary border-b-2 border-gold" : "text-textSecondary"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {rows === null && !error && <p className="text-textSecondary text-sm">Loading…</p>}
        {rows && visible.length === 0 && (
          <p className="text-textSecondary text-sm">
            {tab === "active"
              ? "No roadmaps yet. Generate one from the Skill Gap tool and it will be saved here."
              : "No archived roadmaps."}
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {visible.map((r) => {
            const { done, total, percent } = progressOf(r.roadmap_tasks);
            return (
              <li key={r.id}>
                <Link
                  href={`/roadmaps/${r.id}`}
                  className="block border border-line rounded-card bg-surface p-5 hover:border-gold transition-colors"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <p className="font-display font-semibold">{r.title}</p>
                      <p className="text-xs text-textSecondary mt-1">
                        {r.target_role} · {formatDate(r.created_at)}
                      </p>
                    </div>
                    <span className="font-display text-xl text-gold">{percent}%</span>
                  </div>
                  <ProgressBar percent={percent} />
                  <p className="text-xs text-textSecondary mt-2">
                    {done} of {total} tasks completed
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
