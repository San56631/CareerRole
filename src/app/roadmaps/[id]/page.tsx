"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import TopNav from "@/components/TopNav";
import ProgressBar from "@/components/ProgressBar";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import {
  deleteRoadmap,
  getRoadmap,
  progressOf,
  renameRoadmap,
  RoadmapDetail,
  RoadmapTask,
  setRoadmapStatus,
  setTaskCompleted,
} from "@/lib/roadmaps";

const priorityEmoji: Record<string, string> = { High: "🔴", Medium: "🟡", Low: "🟢" };

export default function RoadmapDetailPage() {
  const user = useRequireAuth();
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [tasks, setTasks] = useState<RoadmapTask[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");

  useEffect(() => {
    if (!user || !params?.id) return;
    getRoadmap(params.id).then(({ roadmap, tasks, error }) => {
      setRoadmap(roadmap);
      setTasks(tasks);
      setError(error ? "This roadmap could not be found." : null);
      if (roadmap) setTitleDraft(roadmap.title);
    });
  }, [user, params?.id]);

  const phases = useMemo(() => {
    const map = new Map<number, { label: string; focus: string | null; tasks: RoadmapTask[] }>();
    for (const t of tasks) {
      if (!map.has(t.phase_index))
        map.set(t.phase_index, { label: t.phase_label, focus: t.phase_focus, tasks: [] });
      map.get(t.phase_index)!.tasks.push(t);
    }
    return Array.from(map.entries()).sort((a, b) => a[0] - b[0]);
  }, [tasks]);

  const { done, total, percent } = progressOf(tasks);

  async function toggleTask(task: RoadmapTask) {
    const next = !task.completed;
    // optimistic update, saved to the database immediately
    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: next } : t)));
    const { error } = await setTaskCompleted(task.id, next);
    if (error) {
      setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, completed: !next } : t)));
      setError(`Could not save your progress: ${error}`);
    } else {
      setError(null);
    }
  }

  async function saveTitle() {
    const title = titleDraft.trim();
    if (!roadmap || !title || title === roadmap.title) {
      setEditing(false);
      setTitleDraft(roadmap?.title ?? "");
      return;
    }
    const { error } = await renameRoadmap(roadmap.id, title);
    if (error) setError(error);
    else setRoadmap({ ...roadmap, title });
    setEditing(false);
  }

  async function toggleArchive() {
    if (!roadmap) return;
    const status = roadmap.status === "active" ? "archived" : "active";
    const { error } = await setRoadmapStatus(roadmap.id, status);
    if (error) setError(error);
    else setRoadmap({ ...roadmap, status });
  }

  async function handleDelete() {
    if (!roadmap || !window.confirm("Delete this roadmap and its progress permanently?")) return;
    const { error } = await deleteRoadmap(roadmap.id);
    if (error) setError(error);
    else router.replace("/roadmaps");
  }

  return (
    <main className="min-h-screen bg-bg text-textPrimary">
      <TopNav />
      <div className="container-x py-12 max-w-2xl">
        <Link href="/roadmaps" className="text-sm text-textSecondary hover:text-gold">
          ← All roadmaps
        </Link>

        {error && <p className="text-sm text-red-400 mt-4">{error}</p>}
        {!roadmap && !error && <p className="text-textSecondary text-sm mt-6">Loading…</p>}

        {roadmap && (
          <>
            <div className="mt-4 mb-6">
              {editing ? (
                <input
                  autoFocus
                  value={titleDraft}
                  onChange={(e) => setTitleDraft(e.target.value)}
                  onBlur={saveTitle}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") saveTitle();
                    if (e.key === "Escape") {
                      setEditing(false);
                      setTitleDraft(roadmap.title);
                    }
                  }}
                  className="font-display text-3xl bg-bg border border-line rounded-card px-3 py-1 w-full"
                />
              ) : (
                <h1 className="font-display text-3xl">
                  {roadmap.title}{" "}
                  <button
                    onClick={() => setEditing(true)}
                    className="text-xs text-textSecondary hover:text-gold align-middle ml-2"
                  >
                    Rename
                  </button>
                </h1>
              )}
              <p className="text-xs text-textSecondary mt-1">
                {roadmap.target_role}
                {roadmap.readiness_score != null && ` · Readiness ${roadmap.readiness_score}/100`}
                {roadmap.status === "archived" && " · Archived"}
              </p>
            </div>

            <div className="border border-line rounded-card bg-surface p-6 mb-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-textSecondary">Overall progress</span>
                <span className="font-display text-xl text-gold">{percent}%</span>
              </div>
              <ProgressBar percent={percent} />
              <p className="text-xs text-textSecondary mt-2">
                {done} of {total} tasks completed
              </p>
            </div>

            <div className="flex flex-col gap-4 mb-8">
              {phases.map(([index, phase]) => {
                const p = progressOf(phase.tasks);
                return (
                  <section key={index} className="border border-line rounded-card bg-surface p-6">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="font-display font-semibold">
                          Phase {index + 1}: {phase.label}
                        </p>
                        {phase.focus && <p className="text-sm text-textSecondary">{phase.focus}</p>}
                      </div>
                      <span className="text-xs text-textSecondary whitespace-nowrap">
                        {p.done} of {p.total}
                      </span>
                    </div>
                    <ul className="space-y-2">
                      {phase.tasks.map((t) => (
                        <li key={t.id}>
                          <label className="flex items-start gap-3 cursor-pointer text-sm">
                            <input
                              type="checkbox"
                              checked={t.completed}
                              onChange={() => toggleTask(t)}
                              className="mt-1 accent-[#d29f22]"
                            />
                            <span className={t.completed ? "line-through text-textSecondary" : ""}>
                              {t.title}
                            </span>
                          </label>
                        </li>
                      ))}
                    </ul>
                  </section>
                );
              })}
            </div>

            {(roadmap.matched_skills.length > 0 || roadmap.missing_skills.length > 0) && (
              <div className="border border-line rounded-card bg-surface p-6 mb-8 grid sm:grid-cols-2 gap-6">
                <div>
                  <h2 className="font-display font-semibold mb-2">✅ Skills you have</h2>
                  <ul className="text-sm text-textSecondary space-y-1">
                    {roadmap.matched_skills.map((s, i) => (
                      <li key={i}>• {s}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h2 className="font-display font-semibold mb-2">🎯 Skills to build</h2>
                  <ul className="text-sm text-textSecondary space-y-1">
                    {roadmap.missing_skills.map((m, i) => (
                      <li key={i}>
                        {priorityEmoji[m.priority] ?? "⚪"}{" "}
                        <span className="text-textPrimary">{m.skill}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex gap-4 text-sm">
              <button onClick={toggleArchive} className="text-textSecondary hover:text-gold">
                {roadmap.status === "active" ? "Archive" : "Restore"}
              </button>
              <button onClick={handleDelete} className="text-textSecondary hover:text-red-400">
                Delete
              </button>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
