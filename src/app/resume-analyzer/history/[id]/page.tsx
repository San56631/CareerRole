"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import AnalysisReport from "@/components/AnalysisReport";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { formatDate, getAnalysis, SavedAnalysis } from "@/lib/resumeHistory";

export default function SavedAnalysisPage() {
  const user = useRequireAuth();
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<SavedAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !params?.id) return;
    getAnalysis(params.id).then(({ row, error }) => {
      setRow(row);
      setError(error ? "This analysis could not be found." : null);
    });
  }, [user, params?.id]);

  return (
    <main className="min-h-screen bg-bg text-textPrimary">
      <TopNav />
      <div className="container-x py-12 max-w-2xl">
        <Link href="/resume-analyzer/history" className="text-sm text-textSecondary hover:text-gold">
          ← All analyses
        </Link>
        {error && <p className="text-sm text-red-400 mt-6">{error}</p>}
        {!row && !error && <p className="text-textSecondary text-sm mt-6">Loading…</p>}
        {row && (
          <div className="mt-4">
            <h1 className="font-display text-3xl">{row.target_role}</h1>
            <p className="text-xs text-textSecondary mt-1 mb-6">
              {formatDate(row.created_at)}
              {row.file_name ? ` · ${row.file_name}` : ""}
            </p>
            <div className="bg-surface border border-line rounded-card p-8">
              <AnalysisReport
                score={row.score}
                strengths={row.strengths}
                weaknesses={row.weaknesses}
                suggestions={row.suggestions}
              />
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
