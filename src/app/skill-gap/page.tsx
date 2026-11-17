"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import { ROLE_GROUPS } from "@/lib/roles";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Link from "next/link";
import { saveRoadmap } from "@/lib/roadmaps";

type SkillGapResult = {
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: { skill: string; priority: "High" | "Medium" | "Low"; reason: string }[];
  roadmap: { phase: string; focus: string; resources: string[] }[];
};

const priorityEmoji: Record<string, string> = {
  High: "🔴",
  Medium: "🟡",
  Low: "🟢",
};

export default function SkillGapPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [extraSkills, setExtraSkills] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SkillGapResult | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const user = useRequireAuth();

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) setFile(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!file) {
      setError("Please upload your resume PDF first.");
      return;
    }
    if (!targetRole) {
      setError("Please select a target role.");
      return;
    }

    setError(null);
    setResult(null);
    setSavedId(null);
    setSaveError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("resume", file);
      formData.append("targetRole", targetRole);
      formData.append("extraSkills", extraSkills);

      const res = await fetch("/api/skill-gap", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Skill gap analysis failed. Please try again.");
      }

      const data: SkillGapResult = await res.json();
      setResult(data);

      // Every generation is saved as its own roadmap with a checklist
      const saved = await saveRoadmap(data, targetRole);
      setSavedId(saved.id);
      setSaveError(saved.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <>
      <TopNav />
      <main
        className="min-h-screen bg-bg text-textPrimary flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage:
            "radial-gradient(circle at center, rgba(210,159,34,0.4) 0%, rgba(25,23,27,1) 30%, rgba(25,23,27,1) 60%, rgba(210,159,34,0.35) 100%)",
        }}
      >
        <div className="max-w-6xl mx-auto px-6 py-16">
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-semibold mb-2">
              Skill Gap Roadmap
            </h1>
            <p className="text-textSecondary">
              Upload your resume, tell us your target role, and we&apos;ll map out what to learn next.
            </p>
          </div>

          <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            <form
              onSubmit={handleSubmit}
              className={`bg-surface border border-line rounded-card p-8 w-full text-left transition-all duration-700 ease-out ${
                result ? "max-w-xl lg:max-w-lg" : "max-w-xl"
              }`}
            >
              {/* Dropzone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`border-2 border-dashed rounded-card px-6 py-14 text-center mb-6 transition-colors ${
                  isDragging ? "border-gold bg-bg" : "border-line"
                }`}
              >
                <p className="font-display font-semibold mb-1">
                  {file ? file.name : "Drag & drop your resume PDF"}
                </p>
                <p className="text-sm text-textSecondary mb-4">
                  {file ? "Ready to analyze" : "or browse from your device"}
                </p>

                <label
                  className="inline-block bg-gold font-display font-semibold px-5 py-2 rounded-card cursor-pointer"
                    text-goldText
                >
                  Browse file
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Target role dropdown */}
              <label className="block mb-6">
                <span className="block mb-2 text-sm text-textSecondary">
                  Target Role
                </span>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="w-full bg-bg border border-line rounded-card px-4 py-2 text-textPrimary"
                >
                  <option value="" disabled>
                    Choose a role
                  </option>
                  {ROLE_GROUPS.map((g) => (
                    <optgroup key={g.group} label={g.group}>
                      {g.roles.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
              </label>

              {/* Extra skills — simple comma-separated free text for now */}
              <label className="block mb-8">
                <span className="block mb-2 text-sm text-textSecondary">
                  Extra skills not on your resume (optional)
                </span>
                <input
                  type="text"
                  value={extraSkills}
                  onChange={(e) => setExtraSkills(e.target.value)}
                  placeholder="e.g. Docker, AWS, Figma"
                  className="w-full bg-bg border border-line rounded-card px-4 py-2 text-textPrimary placeholder:text-textSecondary"
                />
              </label>

              {error && (
                <p className="text-sm mb-4" style={{ color: "#e5484d" }}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="bg-gold font-display font-semibold px-6 py-3 rounded-card block mx-auto disabled:opacity-50 disabled:cursor-not-allowed text-goldText"
              >
                {isLoading ? "Analyzing..." : "Find My Skill Gaps"}
              </button>
            </form>

            {/* Results */}
            {result && (
              <div
                className="bg-surface border border-line rounded-card p-8 max-w-xl lg:max-w-lg w-full text-left"
                style={{ animation: "slideIn 0.7s ease-out" }}
              >
                <h2 className="font-display text-2xl font-semibold mb-6">
                  Readiness:{" "}
                  <span style={{ color: "#d29f22" }}>{result.readinessScore}/100</span>
                </h2>

                <div className="mb-6">
                  <h3 className="font-display font-semibold mb-2">
                    ✅ Skills You Already Have
                  </h3>
                  <ul className="text-textSecondary space-y-1">
                    {result.matchedSkills.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>

                <div className="mb-6">
                  <h3 className="font-display font-semibold mb-2">
                    🎯 Skills To Build
                  </h3>
                  <ul className="text-textSecondary space-y-2">
                    {result.missingSkills.map((m, i) => (
                      <li key={i}>
                        <span>
                          {priorityEmoji[m.priority] ?? "⚪"}{" "}
                          <span className="text-textPrimary font-semibold">
                            {m.skill}
                          </span>{" "}
                          <span className="text-xs">({m.priority})</span>
                        </span>
                        <p className="text-sm ml-6">{m.reason}</p>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-display font-semibold mb-2">
                    🗺️ Your Roadmap
                  </h3>
                  <div className="space-y-4">
                    {result.roadmap.map((r, i) => (
                      <div
                        key={i}
                        className="border-l-2 pl-4"
                        style={{ borderColor: "#d29f22" }}
                      >
                        <p className="font-display font-semibold">
                          📅 {r.phase} — {r.focus}
                        </p>
                        <ul className="text-sm text-textSecondary mt-1 space-y-0.5">
                          {r.resources.map((res, j) => (
                            <li key={j}>💡 {res}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-line text-sm flex items-center justify-between gap-4">
                  {savedId ? (
                    <>
                      <span className="text-textSecondary text-xs">Saved to My Roadmaps</span>
                      <Link href={`/roadmaps/${savedId}`} className="text-gold hover:underline">
                        Open &amp; track progress →
                      </Link>
                    </>
                  ) : saveError ? (
                    <span className="text-xs text-red-400">Could not save: {saveError}</span>
                  ) : (
                    <span className="text-xs text-textSecondary">Saving…</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx global>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(40px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
      `}</style>
    </>
  );
}