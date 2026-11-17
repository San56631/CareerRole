import { supabase } from "@/lib/supabase/client";

export type ChatMessage = { role: "user" | "model"; text: string };

export type InterviewReportData = {
  summary: string;
  overallScore: number;
  categories: { name: string; score: number; feedback: string }[];
  strengths: string[];
  developmentAreas: string[];
};

export type InterviewSession = {
  id: string;
  target_role: string;
  status: "completed" | "incomplete";
  question_count: number;
  messages: ChatMessage[];
  report: InterviewReportData | null;
  overall_score: number | null;
  created_at: string;
};

export async function generateReport(
  targetRole: string,
  messages: ChatMessage[]
): Promise<{ report: InterviewReportData | null; error: string | null }> {
  try {
    const res = await fetch("/api/interview-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetRole, messages }),
    });
    const data = await res.json();
    if (!res.ok) return { report: null, error: data?.error ?? "Failed to generate report" };
    return { report: data as InterviewReportData, error: null };
  } catch {
    return { report: null, error: "Failed to generate report" };
  }
}

export async function saveInterview(input: {
  targetRole: string;
  messages: ChatMessage[];
  report: InterviewReportData | null;
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("interview_sessions")
    .insert({
      target_role: input.targetRole,
      status: "completed",
      question_count: input.messages.filter((m) => m.role === "user").length,
      messages: input.messages,
      report: input.report,
      overall_score: input.report?.overallScore ?? null,
    })
    .select("id")
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function updateInterviewReport(id: string, report: InterviewReportData) {
  const { error } = await supabase
    .from("interview_sessions")
    .update({ report, overall_score: report.overallScore })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function listInterviews() {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("id, target_role, status, question_count, overall_score, created_at")
    .order("created_at", { ascending: false });
  return {
    rows: (data as Pick<
      InterviewSession,
      "id" | "target_role" | "status" | "question_count" | "overall_score" | "created_at"
    >[]) ?? [],
    error: error?.message ?? null,
  };
}

export async function getInterview(id: string) {
  const { data, error } = await supabase
    .from("interview_sessions")
    .select("*")
    .eq("id", id)
    .single();
  return { row: (data as InterviewSession) ?? null, error: error?.message ?? null };
}

export async function deleteInterview(id: string) {
  const { error } = await supabase.from("interview_sessions").delete().eq("id", id);
  return { error: error?.message ?? null };
}
