import type { SavedAnalysis } from "@/lib/resumeHistory";

type Props = Pick<SavedAnalysis, "score" | "strengths" | "weaknesses" | "suggestions">;

// Shared by the analyzer result panel and the saved-report page
export default function AnalysisReport({ score, strengths, weaknesses, suggestions }: Props) {
  const sections = [
    { title: "Strengths", items: strengths },
    { title: "Weaknesses", items: weaknesses },
    { title: "Suggestions", items: suggestions },
  ];
  return (
    <>
      <h2 className="font-display text-2xl font-semibold mb-4">
        Score: <span style={{ color: "#d29f22" }}>{score}/100</span>
      </h2>
      {sections.map((s) => (
        <div key={s.title} className="mb-6 last:mb-0">
          <h3 className="font-display font-semibold mb-2">{s.title}</h3>
          <ul className="list-disc list-inside text-textSecondary space-y-1">
            {s.items.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}
