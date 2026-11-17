"use client";

import { useState, useRef, useEffect } from "react";
import TopNav from "@/components/TopNav";
import { ROLE_GROUPS } from "@/lib/roles";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import Link from "next/link";
import InterviewReport from "@/components/InterviewReport";
import InterviewTranscript from "@/components/InterviewTranscript";
import {
  generateReport,
  InterviewReportData,
  saveInterview,
  updateInterviewReport,
} from "@/lib/interviews";

type ChatMessage = { role: "user" | "model"; text: string };

const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

const TOTAL_QUESTIONS = 5;

export default function MockInterviewPage() {
  const [targetRole, setTargetRole] = useState("");
  const [hasStarted, setHasStarted] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [questionCount, setQuestionCount] = useState(0);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [report, setReport] = useState<InterviewReportData | null>(null);
  const [reportStatus, setReportStatus] = useState<"idle" | "loading" | "ready" | "failed">("idle");
  const [reportError, setReportError] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const user = useRequireAuth();

  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to the latest message whenever the conversation updates
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function callInterviewApi(history: ChatMessage[], count: number) {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/mock-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetRole, history, questionCount: count }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        throw new Error(errData?.error ?? "The interviewer had a problem responding. Please try again.");
      }

      const data = await res.json();
      const finalMessages: ChatMessage[] = [...history, { role: "model", text: data.reply }];
      setMessages(finalMessages);
      if (data.isComplete) {
        setIsComplete(true);
        finishInterview(finalMessages);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  }

  // Called once the interviewer sends the final message: build the full
  // report, then save the whole session (transcript + report) to the cloud.
  async function finishInterview(finalMessages: ChatMessage[]) {
    setReportStatus("loading");
    setReportError(null);
    const { report, error } = await generateReport(targetRole, finalMessages);
    const saved = await saveInterview({ targetRole, messages: finalMessages, report });
    setSessionId(saved.id);
    setSaveError(saved.error);
    if (report) {
      setReport(report);
      setReportStatus("ready");
    } else {
      setReportError(error);
      setReportStatus("failed");
    }
  }

  async function retryReport() {
    setReportStatus("loading");
    setReportError(null);
    const { report, error } = await generateReport(targetRole, messages);
    if (!report) {
      setReportError(error);
      setReportStatus("failed");
      return;
    }
    if (sessionId) {
      const { error: updateError } = await updateInterviewReport(sessionId, report);
      setSaveError(updateError);
    } else {
      const saved = await saveInterview({ targetRole, messages, report });
      setSessionId(saved.id);
      setSaveError(saved.error);
    }
    setReport(report);
    setReportStatus("ready");
  }

  function handleStart() {
    if (!targetRole) {
      setError("Please select a target role first.");
      return;
    }
    setError(null);
    setHasStarted(true);
    callInterviewApi([], 0);
  }

  function handleSendAnswer(e: React.FormEvent) {
    e.preventDefault();
    if (!currentAnswer.trim()) return;

    const updatedMessages: ChatMessage[] = [
      ...messages,
      { role: "user", text: currentAnswer },
    ];
    setMessages(updatedMessages);
    setCurrentAnswer("");

    const newCount = questionCount + 1;
    setQuestionCount(newCount);
    callInterviewApi(updatedMessages, newCount);
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
        <div className={`w-full mx-auto px-6 py-16 transition-all duration-700 ${reportStatus !== "idle" ? "max-w-6xl" : "max-w-3xl"}`}>
          <div className="text-center mb-10">
            <h1 className="font-display text-3xl font-semibold mb-2">
              Mock Interview
            </h1>
            <p className="text-textSecondary">
              A short, focused practice interview — {TOTAL_QUESTIONS} questions, one at a time.
            </p>
          </div>

          {/* Pre-start: role selection */}
          {!hasStarted && (
            <div className="bg-surface border border-line rounded-card p-8 max-w-md mx-auto text-left">
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

              {error && (
                <p className="text-sm mb-4" style={{ color: "#e5484d" }}>
                  {error}
                </p>
              )}

              <button
                onClick={handleStart}
                disabled={isLoading}
                className="bg-gold font-display font-semibold px-6 py-3 rounded-card block mx-auto disabled:opacity-50 disabled:cursor-not-allowed text-goldText"
              >
                {isLoading ? "Starting..." : "Start Interview"}
              </button>
            </div>
          )}

          {/* Chat conversation (moves left once the report appears) */}
          {hasStarted && (
            <div className="flex flex-col lg:flex-row items-start justify-center gap-8">
            <div
              className={`bg-surface border border-line rounded-card p-6 w-full transition-all duration-700 ease-out ${
                reportStatus !== "idle" ? "lg:max-w-md lg:shrink-0" : ""
              }`}
            >
              <div className="max-h-96 overflow-y-auto space-y-4 mb-6 pr-2">
                <InterviewTranscript messages={messages} />

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-card px-4 py-3 bg-bg border border-line text-sm text-textSecondary">
                      Interviewer is typing...
                    </div>
                  </div>
                )}

                <div ref={scrollRef} />
              </div>

              {error && (
                <p className="text-sm mb-4" style={{ color: "#e5484d" }}>
                  {error}
                </p>
              )}

              {isComplete ? (
                <div className="text-center text-sm">
                  <p className="text-textSecondary mb-3">✅ Interview complete — nice work!</p>
                  <p className="text-xs text-textSecondary">
                    {saveError
                      ? `Could not save to history: ${saveError}`
                      : sessionId
                      ? "Saved to your interview history"
                      : ""}
                  </p>
                  <div className="flex justify-center gap-6 mt-3 text-xs">
                    <button onClick={() => window.location.reload()} className="text-gold hover:underline">
                      Start a new interview
                    </button>
                    <Link href="/interviews" className="text-gold hover:underline">
                      View history →
                    </Link>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSendAnswer} className="flex gap-3">
                  <input
                    type="text"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    placeholder="Type your answer..."
                    disabled={isLoading}
                    className="flex-1 bg-bg border border-line rounded-card px-4 py-2 text-textPrimary placeholder:text-textSecondary disabled:opacity-50"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !currentAnswer.trim()}
                    className="bg-gold font-display font-semibold px-5 py-2 rounded-card disabled:opacity-50 disabled:cursor-not-allowed text-goldText"
                  >
                    Send
                  </button>
                </form>
              )}
            </div>

            {/* Report column */}
            {reportStatus !== "idle" && (
              <div
                className="w-full lg:flex-1 min-w-0"
                style={{ animation: "slideIn 0.7s ease-out" }}
              >
                {reportStatus === "loading" && (
                  <div className="bg-surface border border-line rounded-card p-10 text-center">
                    <p className="font-display text-lg mb-2">Preparing your report…</p>
                    <p className="text-sm text-textSecondary">
                      Reviewing all five of your answers. This takes a few seconds.
                    </p>
                  </div>
                )}
                {reportStatus === "failed" && (
                  <div className="bg-surface border border-line rounded-card p-10 text-center">
                    <p className="font-display text-lg mb-2">We couldn&apos;t generate your report</p>
                    <p className="text-sm mb-5" style={{ color: "#e5484d" }}>
                      {reportError}
                    </p>
                    <button
                      onClick={retryReport}
                      className="bg-gold font-display font-semibold px-5 py-2 rounded-card text-goldText"
                    >
                      Try again
                    </button>
                    <p className="text-xs text-textSecondary mt-4">
                      Your answers are saved, so you won&apos;t lose them.
                    </p>
                  </div>
                )}
                {reportStatus === "ready" && report && (
                  <InterviewReport report={report} role={targetRole} dateLabel={todayLabel()} />
                )}
              </div>
            )}
            </div>
          )}
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