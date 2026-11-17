import { chatWithRetry } from "@/lib/gemini";
import { NextRequest, NextResponse } from "next/server";

type ChatMessage = { role: "user" | "model"; text: string };

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetRole: string = body.targetRole;
    const history: ChatMessage[] = body.history ?? [];
    const questionCount: number = body.questionCount ?? 0;

    if (!targetRole) {
      return NextResponse.json({ error: "No target role provided" }, { status: 400 });
    }

    const TOTAL_QUESTIONS = 5;
    const isLastQuestion = questionCount >= TOTAL_QUESTIONS - 1;

    const systemInstruction = `
You are a friendly but realistic mock interviewer for a student targeting the role of "${targetRole}".
Ask exactly one question at a time. Keep questions relevant to "${targetRole}" — mix of
technical and behavioral. Keep each question short (1-3 sentences).

When the student answers, briefly react (1 sentence, encouraging but honest) before asking
the next question. Do not repeat a question you've already asked in this conversation.

${
  isLastQuestion
    ? `This is the LAST question of the interview (question ${TOTAL_QUESTIONS} of ${TOTAL_QUESTIONS}).
After the student answers this one, do NOT ask another question and do NOT give detailed feedback
(a full written report is generated separately). Respond with one or two short, warm sentences
thanking them and saying their report is being prepared. Prefix this final message with
"INTERVIEW_COMPLETE:" exactly.`
    : `This is question ${questionCount + 1} of ${TOTAL_QUESTIONS}.`
}

Respond with plain conversational text only — no JSON, no markdown formatting.
`;

    // Gemini requires history to start with a user turn and the final user
    // message to be sent separately (not duplicated inside history).
    const START = "Start the interview with your first question.";
    const chatHistory: ChatMessage[] =
      history.length === 0
        ? []
        : [{ role: "user", text: START }, ...history.slice(0, -1)];
    const message = history.length === 0 ? START : history[history.length - 1].text;

    const result = await chatWithRetry({ systemInstruction, history: chatHistory, message });
    const responseText = result.response.text();

    return NextResponse.json({
      reply: responseText,
      isComplete: responseText.startsWith("INTERVIEW_COMPLETE:"),
    });
  } catch (error: any) {
    console.error("Mock interview error:", error);
    if (error?.status === 429) {
      return NextResponse.json(
        { error: "AI usage limit reached. Please try again later." },
        { status: 429 }
      );
    }
    if (error?.status === 503) {
      return NextResponse.json(
        { error: "The AI service is temporarily busy. Please try again in a moment." },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: "Failed to continue interview" }, { status: 500 });
  }
}
