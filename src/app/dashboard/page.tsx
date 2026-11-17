"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { listAnalyses } from "@/lib/resumeHistory";
import { listRoadmaps, progressOf } from "@/lib/roadmaps";
import { listInterviews } from "@/lib/interviews";
import TopNav from "@/components/TopNav";

const MODULES = [
  {
    name: "Resume Analyzer",
    desc: "Upload your resume and get a score against your target role.",
    href: "/resume-analyzer",
    tag: "01",
    comingSoon: false,
  },
  {
    name: "Skill Gap Roadmap",
    desc: "See what's missing between your skills and your target role.",
    href: "/skill-gap",
    tag: "02",
    comingSoon: false,
  },
  {
    name: "Mock Interview",
    desc: "Practice role-specific questions and get structured feedback.",
    href: "/mock-interview",
    tag: "03",
    comingSoon: false,
  },
  {
    name: "Career Advisor Agent",
    desc: "Let AI decide what you should work on next.",
    href: "/agent",
    tag: "04",
    comingSoon: true,
  },
];

export default function DashboardPage() {
  const user = useRequireAuth();
  const [latestScore, setLatestScore] = useState<number | null>(null);
  const [analysisCount, setAnalysisCount] = useState(0);
  const [roadmapPercent, setRoadmapPercent] = useState<number | null>(null);
  const [interviewCount, setInterviewCount] = useState(0);

  useEffect(() => {
    if (!user) return;
    listAnalyses().then(({ rows }) => {
      setAnalysisCount(rows.length);
      setLatestScore(rows[0]?.score ?? null);
    });
    listInterviews().then(({ rows }) => {
      setInterviewCount(rows.filter((r) => r.status === "completed").length);
    });
    listRoadmaps().then(({ rows }) => {
      const active = rows.filter((r) => r.status === "active");
      if (active.length === 0) return setRoadmapPercent(null);
      const all = active.flatMap((r) => r.roadmap_tasks);
      setRoadmapPercent(progressOf(all).percent);
    });
  }, [user]);

  return (
    <main className="min-h-screen bg-bg">
      <TopNav />

      <div className="container-x py-12">
        {/* Welcome */}
        <h1 className="font-display text-3xl text-textPrimary mb-2">
          Welcome{user ? `, ${user.name.split(" ")[0]}` : ""}
        </h1>
        <p className="text-textSecondary mb-10">
          Targeting: {user ? user.targetRole : "Not set yet"}
        </p>

        {/* Stats summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="border border-line rounded-card p-5 bg-surface">
            <p className="font-display text-2xl text-textPrimary">{latestScore ?? "—"}</p>
            <p className="text-xs text-textSecondary mt-1">Latest resume score</p>
          </div>
          <div className="border border-line rounded-card p-5 bg-surface">
            <p className="font-display text-2xl text-textPrimary">{analysisCount}</p>
            <p className="text-xs text-textSecondary mt-1">Resumes analyzed</p>
          </div>
          <div className="border border-line rounded-card p-5 bg-surface">
            <p className="font-display text-2xl text-textPrimary">{roadmapPercent != null ? `${roadmapPercent}%` : "—"}</p>
            <p className="text-xs text-textSecondary mt-1">Roadmap progress</p>
          </div>
          <div className="border border-line rounded-card p-5 bg-surface">
            <p className="font-display text-2xl text-textPrimary">{interviewCount}</p>
            <p className="text-xs text-textSecondary mt-1">Mock interviews done</p>
          </div>
        </div>

        {/* Module cards */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-2xl text-textPrimary">Your tools</h2>
          <div className="flex flex-wrap gap-x-6 gap-y-1 justify-end">
            <Link href="/roadmaps" className="text-sm text-gold hover:underline">
              My roadmaps →
            </Link>
            <Link href="/interviews" className="text-sm text-gold hover:underline">
              Interview history →
            </Link>
            <Link href="/resume-analyzer/history" className="text-sm text-gold hover:underline">
              Resume history →
            </Link>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {MODULES.map((m) =>
            m.comingSoon ? (
              <div
                key={m.name}
                className="border border-line rounded-card p-6 bg-surface opacity-60 cursor-not-allowed block relative"
              >
                <span className="absolute top-4 right-4 text-[10px] uppercase tracking-wide bg-line text-textSecondary px-2 py-1 rounded-card">
                  Coming soon
                </span>
                <span className="text-goldDeep font-display text-lg">
                  {m.tag}
                </span>
                <h3 className="font-display text-lg font-semibold text-textPrimary mt-2 mb-2">
                  {m.name}
                </h3>
                <p className="text-textSecondary text-sm leading-relaxed">
                  {m.desc}
                </p>
              </div>
            ) : (
              <Link
                key={m.name}
                href={m.href}
                className="border border-line rounded-card p-6 bg-gold hover:bg-bg transition-colors block group"
              >
                <span className="text-maroon font-display text-lg group-hover:text-goldDeep transition-colors">
                  {m.tag}
                </span>
                <h3 className="font-display text-lg font-semibold text-bg group-hover:text-textPrimary mt-2 mb-2 transition-colors">
                  {m.name}
                </h3>
                <p className="text-[#412402] group-hover:text-textSecondary text-sm leading-relaxed transition-colors">
                  {m.desc}
                </p>
              </Link>
            )
          )}
        </div>
      </div>
    </main>
  );
}