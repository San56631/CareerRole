"use client";

import { useState } from "react";
import ScoreRing from "@/components/ScoreRing";
import type { InterviewReportData } from "@/lib/interviews";

function Accordion({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border border-line rounded-card bg-surface overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
      >
        <span className="font-display font-semibold tracking-wide text-textPrimary">{title}</span>
        <span className={`text-textSecondary transition-transform ${open ? "rotate-180" : ""}`}>⌃</span>
      </button>
      {open && <div className="px-5 pb-5">{children}</div>}
    </div>
  );
}

export default function InterviewReport({
  report,
  role,
  dateLabel,
}: {
  report: InterviewReportData;
  role: string;
  dateLabel: string;
}) {
  return (
    <div className="flex flex-col gap-4 text-left">
      {/* Session summary */}
      <div className="border border-line rounded-card bg-surface p-6">
        <p className="text-xs uppercase tracking-[0.2em] text-textSecondary">Session summary</p>
        <p className="text-xs text-textSecondary mt-2">
          {dateLabel} · {role}
        </p>

        <div className="mt-5 rounded-card bg-bg border border-line p-5">
          <p className="text-sm text-textPrimary leading-relaxed">{report.summary}</p>
          <div className="flex justify-center mt-6">
            <ScoreRing score={report.overallScore} size={140} />
          </div>
        </div>
      </div>

      {/* Per-category breakdown */}
      {report.categories.map((c, i) => (
        <Accordion key={c.name} title={c.name} defaultOpen={i === 0}>
          <p className="text-sm text-textSecondary leading-relaxed">{c.feedback}</p>
          <div className="flex justify-center mt-5">
            <ScoreRing score={c.score} size={96} />
          </div>
        </Accordion>
      ))}

      <Accordion title="Strengths">
        <ul className="list-disc list-inside space-y-2 text-sm text-textSecondary">
          {report.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </Accordion>

      <Accordion title="Development Areas">
        <ul className="list-disc list-inside space-y-2 text-sm text-textSecondary">
          {report.developmentAreas.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </Accordion>
    </div>
  );
}
