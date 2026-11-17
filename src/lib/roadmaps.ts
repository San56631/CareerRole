import { supabase } from "@/lib/supabase/client";

export type SkillGapResult = {
  readinessScore: number;
  matchedSkills: string[];
  missingSkills: { skill: string; priority: "High" | "Medium" | "Low"; reason: string }[];
  roadmap: { phase: string; focus: string; resources: string[] }[];
};

export type RoadmapTask = {
  id: string;
  roadmap_id: string;
  phase_index: number;
  phase_label: string;
  phase_focus: string | null;
  position: number;
  title: string;
  completed: boolean;
};

export type RoadmapSummary = {
  id: string;
  title: string;
  target_role: string;
  readiness_score: number | null;
  status: "active" | "archived";
  created_at: string;
  roadmap_tasks: { id: string; completed: boolean }[];
};

export type RoadmapDetail = {
  id: string;
  title: string;
  target_role: string;
  readiness_score: number | null;
  matched_skills: string[];
  missing_skills: SkillGapResult["missingSkills"];
  status: "active" | "archived";
  created_at: string;
};

export function progressOf(tasks: { completed: boolean }[]) {
  const total = tasks.length;
  const done = tasks.filter((t) => t.completed).length;
  return { total, done, percent: total === 0 ? 0 : Math.round((done / total) * 100) };
}

// Every generation creates a NEW roadmap; nothing is ever overwritten.
export async function saveRoadmap(
  result: SkillGapResult,
  targetRole: string
): Promise<{ id: string | null; error: string | null }> {
  const { data: roadmap, error } = await supabase
    .from("saved_roadmaps")
    .insert({
      title: `${targetRole} roadmap`,
      target_role: targetRole,
      readiness_score: result.readinessScore,
      matched_skills: result.matchedSkills,
      missing_skills: result.missingSkills,
    })
    .select("id")
    .single();
  if (error || !roadmap) return { id: null, error: error?.message ?? "Could not create roadmap" };

  // Each resource suggestion becomes one tickable task
  const tasks = result.roadmap.flatMap((phase, phaseIndex) => {
    const items = phase.resources?.length ? phase.resources : [phase.focus];
    return items.map((title, position) => ({
      roadmap_id: roadmap.id,
      phase_index: phaseIndex,
      phase_label: phase.phase,
      phase_focus: phase.focus,
      position,
      title,
    }));
  });

  const { error: taskError } = await supabase.from("roadmap_tasks").insert(tasks);
  if (taskError) {
    // don't leave an empty roadmap behind
    await supabase.from("saved_roadmaps").delete().eq("id", roadmap.id);
    return { id: null, error: taskError.message };
  }
  return { id: roadmap.id, error: null };
}

export async function listRoadmaps() {
  const { data, error } = await supabase
    .from("saved_roadmaps")
    .select("id, title, target_role, readiness_score, status, created_at, roadmap_tasks(id, completed)")
    .order("created_at", { ascending: false });
  return { rows: (data as unknown as RoadmapSummary[]) ?? [], error: error?.message ?? null };
}

export async function getRoadmap(id: string) {
  const { data: roadmap, error } = await supabase
    .from("saved_roadmaps")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !roadmap) return { roadmap: null, tasks: [], error: error?.message ?? "Not found" };

  const { data: tasks, error: taskError } = await supabase
    .from("roadmap_tasks")
    .select("*")
    .eq("roadmap_id", id)
    .order("phase_index")
    .order("position");
  return {
    roadmap: roadmap as RoadmapDetail,
    tasks: (tasks as RoadmapTask[]) ?? [],
    error: taskError?.message ?? null,
  };
}

export async function setTaskCompleted(taskId: string, completed: boolean) {
  const { error } = await supabase
    .from("roadmap_tasks")
    .update({ completed, completed_at: completed ? new Date().toISOString() : null })
    .eq("id", taskId);
  return { error: error?.message ?? null };
}

export async function renameRoadmap(id: string, title: string) {
  const { error } = await supabase
    .from("saved_roadmaps")
    .update({ title, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function setRoadmapStatus(id: string, status: "active" | "archived") {
  const { error } = await supabase
    .from("saved_roadmaps")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteRoadmap(id: string) {
  const { error } = await supabase.from("saved_roadmaps").delete().eq("id", id);
  return { error: error?.message ?? null };
}
