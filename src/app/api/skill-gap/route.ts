import { generateWithRetry } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const targetRole = formData.get("targetRole") as string;
    const extraSkills = formData.get("extraSkills") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }
    if (!targetRole) {
      return NextResponse.json({ error: "No target role provided" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");


    const extraSkillsList = extraSkills
      ?.split(",")
      .map((s) => s.trim())
      .filter(Boolean) ?? [];

    const prompt = `
You are a career skill-gap analyst helping a student targeting the role of "${targetRole}".

Read the attached resume PDF to identify their current skills.

The student has ALSO manually confirmed they know these additional skills, which may or
may not already appear on the resume: ${
      extraSkillsList.length > 0 ? extraSkillsList.join(", ") : "(none provided)"
    }

IMPORTANT: Every skill in that manually-confirmed list MUST appear in "matchedSkills"
in your response, even if it wasn't mentioned anywhere in the resume PDF. Do not skip
or ignore any of them.

Combine both sources, then compare against what is typically required for "${targetRole}"
roles at a fresher/entry level.

Respond with ONLY raw JSON, no markdown, no code fences, no commentary before or after,
in exactly this shape:

{
  "readinessScore": <number 0-100>,
  "matchedSkills": ["skill the student already has that's relevant to this role"],
  "missingSkills": [
    { "skill": "skill name", "priority": "High" | "Medium" | "Low", "reason": "short reason specific to this role" }
  ],
  "roadmap": [
    { "phase": "short label like 'Weeks 1-2'", "focus": "what to learn", "resources": ["short suggestion", "short suggestion"] }
  ]
}

Keep matchedSkills to 4-8 items, missingSkills to 4-6 items, roadmap to 3-4 phases.
Be specific to this resume and role, not generic advice.
`;

    const result = await generateWithRetry([
      {
        inlineData: {
          data: base64Data,
          mimeType: "application/pdf",
        },
      },
      { text: prompt },
    ]);

    const responseText = result.response.text();

    // Robust extraction: pull out just the {...} block, ignoring any
    // stray text Gemini might add before/after despite instructions
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("No JSON found in Gemini response:", responseText);
      return NextResponse.json(
        { error: "Failed to analyze skill gap" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Skill gap analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze skill gap" },
      { status: 500 }
    );
  }
}