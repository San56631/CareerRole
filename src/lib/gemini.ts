import { GoogleGenerativeAI } from "@google/generative-ai";

// Change models in .env.local (no code edits needed if Google retires one).
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-3.5-flash-lite";
export const GEMINI_FALLBACK_MODEL = process.env.GEMINI_FALLBACK_MODEL || "gemini-2.5-flash";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Errors worth retrying / falling back on: overloaded (503), server error (500),
// rate limited (429), or model not found (404).
function isRetryable(error: any) {
  return [429, 500, 503, 404].includes(error?.status);
}

// Tries the main model up to 3 times with backoff on temporary errors,
// then falls back to a second model before giving up.
export async function generateWithRetry(parts: any[]) {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
  let lastError: any;

  for (const modelName of models) {
    const model = genAI.getGenerativeModel({ model: modelName });
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        return await model.generateContent(parts);
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini ${modelName} attempt ${attempt + 1} failed:`, error?.status);
        if (!isRetryable(error)) throw error;
        // 404 / 429 won't fix themselves on the same model: go straight to fallback
        if (error?.status === 404 || error?.status === 429) break;
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}

// Same retry + fallback behaviour, for multi-turn chats (mock interview).
export async function chatWithRetry(opts: {
  systemInstruction: string;
  history: { role: "user" | "model"; text: string }[];
  message: string;
}) {
  const models = [GEMINI_MODEL, GEMINI_FALLBACK_MODEL];
  let lastError: any;

  for (const modelName of models) {
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const chat = model.startChat({
          history: opts.history.map((m) => ({ role: m.role, parts: [{ text: m.text }] })),
          systemInstruction: { role: "system", parts: [{ text: opts.systemInstruction }] },
        });
        return await chat.sendMessage(opts.message);
      } catch (error: any) {
        lastError = error;
        console.error(`Gemini chat ${modelName} attempt ${attempt + 1} failed:`, error?.status);
        if (!isRetryable(error)) throw error;
        if (error?.status === 404 || error?.status === 429) break;
        await sleep(1500 * (attempt + 1));
      }
    }
  }
  throw lastError;
}
