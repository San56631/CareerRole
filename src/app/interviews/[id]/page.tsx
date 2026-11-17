"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import InterviewReport from "@/components/InterviewReport";
import InterviewTranscript from "@/components/InterviewTranscript";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { generateReport, getInterview, InterviewSession, updateInterviewReport } from "@/lib/interviews";
import { formatDate } from "@/lib/resumeHistory";

export default function SavedInterviewPage() {
  const user = useRequireAuth();
  const params = useParams<{ id: string }>();
  const [row, setRow] = useState<InterviewSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [regenerating, setRegenerating] = useState(false);
  const [reportError, setReportError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !params?.id) return;
    getInterview(params.id).then(({ row, error }) => {
      setRow(row);
      setError(error ? "This interview could not be found." : null);
    });
  }, [user, params?.id]);

  async function regenerate() {
    if (!row) return;
    setRegenerating(true);
    setReportError(null);
    const { report, error } = await generateReport(row.target_role, row.messages);
    if (!report) {
      setReportError(error);
    } else {
      await updateInterviewReport(row.id, report);
      setRow({ ...row, report, overall_score: report.overallScore });
    }
    setRegenerating(false);
  }

  return (
    <main className="min-h-screen bg-bg text-textPrimary">
      <TopNav />
      <div className="container-x py-12 max-w-6xl">
        <Link href="/interviews" className="text-sm text-textSecondary hover:text-gold">
          ← All interviews
        </Link>
        {error && <p className="text-sm text-red-400 mt-6">{error}</p>}
        {!row && !error && <p className="text-textSecondary text-sm mt-6">Loading…</p>}

        {row && (
          <>
            <h1 className="font-display text-3xl mt-4">{row.target_role}</h1>
            <p className="text-xs text-textSecondary mt-1 mb-8">
              {formatDate(row.created_at)} · {row.question_count} questions
            </p>

            <div className="flex flex-col lg:flex-row items-start gap-8">
              <div className="bg-surface border border-line rounded-card p-6 w-full lg:max-w-md lg:shrink-0 space-y-4">
                <InterviewTranscript messages={row.messages} />
              </div>

              <div className="w-full lg:flex-1 min-w-0">
                {row.report ? (
                  <InterviewReport
                    report={row.report}
                    role={row.target_role}
                    dateLabel={formatDate(row.created_at)}
                  />
                ) : (
                  <div className="bg-surface border border-line rounded-card p-10 text-center">
                    <p className="font-display text-lg mb-2">No report for this interview yet</p>
                    {reportError && (
                      <p className="text-sm mb-4" style={{ color: "#e5484d" }}>
                        {reportError}
                      </p>
                    )}
                    <button
                      onClick={regenerate}
                      disabled={regenerating}
                      className="bg-gold font-display font-semibold px-5 py-2 rounded-card text-goldText disabled:opacity-50"
                    >
                      {regenerating ? "Generating…" : "Generate report"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
