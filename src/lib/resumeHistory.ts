import { supabase } from "@/lib/supabase/client";

export type SavedAnalysis = {
  id: string;
  target_role: string;
  file_name: string | null;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
  created_at: string;
};

export async function saveAnalysis(input: {
  targetRole: string;
  fileName: string;
  score: number;
  strengths: string[];
  weaknesses: string[];
  suggestions: string[];
}): Promise<{ id: string | null; error: string | null }> {
  const { data, error } = await supabase
    .from("resume_analyses")
    .insert({
      target_role: input.targetRole,
      file_name: input.fileName,
      score: input.score,
      strengths: input.strengths,
      weaknesses: input.weaknesses,
      suggestions: input.suggestions,
    })
    .select("id")
    .single();
  return { id: data?.id ?? null, error: error?.message ?? null };
}

export async function listAnalyses(): Promise<{ rows: SavedAnalysis[]; error: string | null }> {
  const { data, error } = await supabase
    .from("resume_analyses")
    .select("*")
    .order("created_at", { ascending: false });
  return { rows: (data as SavedAnalysis[]) ?? [], error: error?.message ?? null };
}

export async function getAnalysis(id: string) {
  const { data, error } = await supabase
    .from("resume_analyses")
    .select("*")
    .eq("id", id)
    .single();
  return { row: (data as SavedAnalysis) ?? null, error: error?.message ?? null };
}

export async function deleteAnalysis(id: string) {
  const { error } = await supabase.from("resume_analyses").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
