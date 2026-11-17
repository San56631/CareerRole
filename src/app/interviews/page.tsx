"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { deleteInterview, listInterviews } from "@/lib/interviews";
import { formatDate } from "@/lib/resumeHistory";

type Row = Awaited<ReturnType<typeof listInterviews>>["rows"][number];

export default function InterviewHistoryPage() {
  const user = useRequireAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    listInterviews().then(({ rows, error }) => {
      setRows(rows);
      setError(error);
    });
  }, [user]);

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this interview permanently?")) return;
    const { error } = await deleteInterview(id);
    if (error) setError(error);
    else setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
  }

  return (
    <main className="min-h-screen bg-bg text-textPrimary">
      <TopNav />
      <div className="container-x py-12 max-w-3xl">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display text-3xl">Interview history</h1>
          <Link href="/mock-interview" className="bg-gold text-goldText text-sm font-medium rounded-card px-4 py-2">
            New interview
          </Link>
        </div>

        {error && <p className="text-sm text-red-400 mb-4">{error}</p>}
        {rows === null && !error && <p className="text-textSecondary text-sm">Loading…</p>}
        {rows && rows.length === 0 && (
          <p className="text-textSecondary text-sm">
            No interviews yet. Finish a mock interview and it will show up here.
          </p>
        )}

        <ul className="flex flex-col gap-3">
          {rows?.map((r) => (
            <li
              key={r.id}
              className="border border-line rounded-card bg-surface flex items-center hover:border-gold transition-colors"
            >
              <Link href={`/interviews/${r.id}`} className="flex-1 p-5">
                <p className="font-display font-semibold">{r.target_role}</p>
                <p className="text-xs text-textSecondary mt-1">
                  {formatDate(r.created_at)} · {r.question_count} questions ·{" "}
                  <span className={r.status === "completed" ? "text-gold" : ""}>
                    {r.status === "completed" ? "Completed" : "Incomplete"}
                  </span>
                </p>
              </Link>
              <span className="font-display text-xl text-gold px-4">
                {r.overall_score != null ? `${r.overall_score}/10` : "—"}
              </span>
              <button
                onClick={() => handleDelete(r.id)}
                className="text-xs text-textSecondary hover:text-red-400 px-4 py-5"
                aria-label="Delete interview"
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
