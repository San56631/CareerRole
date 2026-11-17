import { generateWithRetry } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";


export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("resume") as File;
    const targetRole = formData.get("targetRole") as string;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Convert the uploaded PDF into base64 so we can send it to Gemini
    const bytes = await file.arrayBuffer();
    const base64Data = Buffer.from(bytes).toString("base64");


    const prompt = `
You are a resume reviewer helping a student targeting the role of "${targetRole}".
Read the attached resume PDF and respond ONLY with valid JSON, no markdown, no backticks, in this exact shape:

{
  "score": <number 0-100>,
  "strengths": ["short point", "short point"],
  "weaknesses": ["short point", "short point"],
  "suggestions": ["specific actionable fix", "specific actionable fix"]
}

Keep each array to 3-4 items. Be specific to the resume content, not generic advice.
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
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(cleaned);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Resume analysis error:", error);
    return NextResponse.json(
      { error: "Failed to analyze resume" },
      { status: 500 }
    );
  }
}