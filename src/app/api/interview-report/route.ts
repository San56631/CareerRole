import { generateWithRetry } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

type ChatMessage = { role: "user" | "model"; text: string };

const clamp = (n: unknown) => Math.max(0, Math.min(10, Math.round(Number(n) * 10) / 10 || 0));

export async function POST(req: NextRequest) {
  try {
    const { targetRole, messages } = (await req.json()) as {
      targetRole: string;
      messages: ChatMessage[];
    };
    if (!targetRole || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Missing interview data" }, { status: 400 });
    }

    const transcript = messages
      .map((m) =>
        `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.text.replace("INTERVIEW_COMPLETE:", "").trim()}`
      )
      .join("\n\n");

    const prompt = `
You are an experienced interview coach. Below is the transcript of a 5-question mock interview
for a student targeting the role of "${targetRole}". Write an honest, specific evaluation of the
candidate's performance based ONLY on what they actually said. If answers were very short,
vague or off-topic, score them low and say so. Do not inflate scores.

Address the candidate directly as "you".

TRANSCRIPT:
${transcript}

Respond with ONLY raw JSON, no markdown, no code fences, in exactly this shape:

{
  "summary": "3-4 sentence overall assessment",
  "overallScore": <number 0-10, one decimal>,
  "categories": [
    { "name": "Technical Knowledge", "score": <integer 0-10>, "feedback": "4-5 sentences, citing specific answers" },
    { "name": "Problem Solving", "score": <integer 0-10>, "feedback": "..." },
    { "name": "Communication Skills", "score": <integer 0-10>, "feedback": "..." },
    { "name": "Structure & Clarity", "score": <integer 0-10>, "feedback": "..." },
    { "name": "Role Readiness", "score": <integer 0-10>, "feedback": "..." }
  ],
  "strengths": ["specific strength", "specific strength", "specific strength"],
  "developmentAreas": ["specific, actionable improvement", "specific, actionable improvement", "specific, actionable improvement"]
}
`;

    const result = await generateWithRetry([{ text: prompt }]);
    const text = result.response.text();
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON in report response");
    const parsed = JSON.parse(match[0]);

    const report = {
      summary: String(parsed.summary ?? ""),
      overallScore: clamp(parsed.overallScore),
      categories: (parsed.categories ?? []).map((c: any) => ({
        name: String(c.name ?? ""),
        score: clamp(c.score),
        feedback: String(c.feedback ?? ""),
      })),
      strengths: (parsed.strengths ?? []).map(String),
      developmentAreas: (parsed.developmentAreas ?? []).map(String),
    };
    return NextResponse.json(report);
  } catch (error: any) {
    console.error("Interview report error:", error);
    const busy = error?.status === 503 || error?.status === 429;
    return NextResponse.json(
      { error: busy ? "The AI service is busy. Please try again in a moment." : "Failed to generate report" },
      { status: busy ? 503 : 500 }
    );
  }
}
