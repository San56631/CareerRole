import type { ChatMessage } from "@/lib/interviews";

export default function InterviewTranscript({ messages }: { messages: ChatMessage[] }) {
  return (
    <>
      {messages.map((msg, i) => (
        <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
          <div
            className={`rounded-card px-4 py-3 max-w-[85%] text-sm ${
              msg.role === "user" ? "bg-gold" : "bg-bg border border-line"
            }`}
            style={msg.role === "user" ? { color: "#412402" } : undefined}
          >
            {msg.role === "model" && (
              <span className="block text-xs mb-1" style={{ color: "#d29f22" }}>
                🎙️ Interviewer
              </span>
            )}
            {msg.text.replace("INTERVIEW_COMPLETE:", "").trim()}
          </div>
        </div>
      ))}
    </>
  );
}
