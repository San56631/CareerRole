"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { deleteAnalysis, formatDate, listAnalyses, SavedAnalysis } from "@/lib/resumeHistory";

export default function ResumeHistoryPage() {
  const user = useRequireAuth();
  const [rows, setRows] = useState<SavedAnalysis[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listAnalyses().then(({ rows, error }) => {
      setRows(rows);
      setError(error);
    });
  }, [user]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this analysis permanently?")) return;
    const { error } = await deleteAnalysis(id);
    if (error) setError(error);
    else setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  return (
    <main className="min-h-screen bg-bg text-textPrimary">
      <TopNav />
      <div className="container-x py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Resume analysis history</h1>
          <Link
            href="/resume-analyzer"
            className="bg-gold text-goldText text-sm font-medium rounded-card px-4 py-2"
          >
            New analysis
          </Link>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {rows === null && !error && <p className="text-textSecondary text-sm">Loading…</p>}
        {rows && rows.length === 0 && (
          <p className="text-textSecondary text-sm">
            No saved analyses yet. Analyze a resume and it will show up here.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {rows?.map((r) => (
            <li
              key={r.id}
              className="border border-line rounded-card bg-surface flex items-center justify-between hover:border-gold transition-colors"
            >
              <Link href={`/resume-analyzer/history/${r.id}`} className="flex-1 p-5">
                <p className="font-display font-semibold">{r.target_role}</p>
                <p className="text-xs text-textSecondary mt-1">
                  {formatDate(r.created_at)}
                  {r.file_name ? ` · ${r.file_name}` : ""}
                </p>
              </Link>
              <span className="font-display text-xl text-gold px-4">{r.score}/100</span>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-xs text-textSecondary hover:text-red-400 px-4 py-5"
                aria-label="Delete analysis"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
