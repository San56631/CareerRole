"use client";

import { useState } from "react";
import TopNav from "@/components/TopNav";
import { ROLE_GROUPS } from "@/lib/roles";
import Link from "next/link";
import AnalysisReport from "@/components/AnalysisReport";
import { saveAnalysis } from "@/lib/resumeHistory";
import { useRequireAuth } from "@/hooks/useRequireAuth";

type AnalysisResult = {
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
};

export default function ResumeAnalyzerPage() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "failed">("idle");
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
        setError("Please upload a resume PDF first.");
        return;
    }

    if (!targetRole) {
        setError("Please select a target role.");
        return;
    }

    setError(null);
    setResult(null);
    setSaveStatus("idle");
    setIsLoading(true);

    try {
        const formData = new FormData();
        formData.append("resume", file);
        formData.append("targetRole", targetRole);

        const res = await fetch("/api/analyze-resume", {
        method: "POST",
        body: formData,
        });

        if (!res.ok) {
        throw new Error("Analysis failed. Please try again.");
        }

        const data: AnalysisResult = await res.json();
        setResult(data);

        // Save to the cloud so it survives refresh / logout / other devices
        const saved = await saveAnalysis({
          targetRole,
          fileName: file.name,
          score: data.score,
          strengths: data.strengths,
          weaknesses: data.weaknesses,
          suggestions: data.suggestions,
        });
        setSaveStatus(saved.error ? "failed" : "saved");
        setSaveError(saved.error);
        if (saved.error) console.error("Saving analysis failed:", saved.error);
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
                Resume Analyzer
            </h1>
            <p className="text-textSecondary">
                Upload your resume as a PDF and get AI-powered feedback tailored to your target role.
            </p>
            </div>

            {/* Two-column row: form + results */}
            <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            {/* Form column */}
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
                    className="inline-block bg-gold font-display font-semibold px-5 py-2 rounded-card cursor-pointer text-goldText"
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

                <label className="block mb-8">
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
                {isLoading ? "Analyzing..." : "Analyze Resume"}
                </button>
            </form>

            {/* Results column — only takes up space once it exists */}
            {result && (
                <div
                    className="bg-surface border border-line rounded-card p-8 max-w-xl lg:max-w-lg w-full text-left"
                    style={{ animation: "slideIn 0.7s ease-out" }}
                >
                <AnalysisReport
                    score={result.score}
                    strengths={result.strengths}
                    weaknesses={result.weaknesses}
                    suggestions={result.suggestions}
                />
                <div className="mt-6 pt-4 border-t border-line text-xs text-textSecondary flex items-center justify-between">
                    <span>
                    {saveStatus === "saved" && "Saved to your history"}
                    {saveStatus === "failed" && `Could not save: ${saveError}`}
                    </span>
                    <Link href="/resume-analyzer/history" className="text-gold hover:underline">
                    View history →
                    </Link>
                </div>
                </div>
            )}
            </div>
        </div>
        </main>

        {/* Keyframes for the results slide-in */}
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