# CareerRole

AI-powered career guidance for students without access to a placement cell.

## The problem

Students at Tier 2/3 Indian colleges often don't have campus placement cells, mentors, or paid career coaching. CareerRole gives them AI-driven resume feedback, a personalized skill gap roadmap, and mock interview practice — for free.

## Features

- **Resume Analyzer** — Upload a resume PDF, get a score out of 100 with specific strengths, weaknesses, and actionable suggestions, tailored to your target role.
- **Skill Gap Roadmap** — See exactly which skills you're missing for your target role, ranked by priority, plus a phased learning roadmap with resource suggestions.
- **Mock Interview** — A conversational, one-question-at-a-time mock interview with real-time reactions and closing feedback.
- **Career Advisor Agent** *(in progress)* — An orchestration layer that uses LLM tool-calling to decide what a student should work on next across all three modules above.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Styling:** Tailwind CSS, custom dark gold/maroon theme
- **AI:** Google Gemini (`gemini-2.5-flash-lite`) via `@google/generative-ai`
- **Auth:** React Context (currently mock/demo auth — no real backend yet)

## Getting started

```bash
git clone https://github.com/Codejourn/CareerRole.git
cd CareerRole
npm install
```

Create a `.env.local` file in the project root:
GEMINI_API_KEY=your_key_here
Then run the dev server:

```bash
npm run dev
```

Visit `http://localhost:3000`.

## Project status

Early-stage build. Resume Analyzer, Skill Gap Roadmap, and Mock Interview are fully functional. The Career Advisor Agent (tool-calling orchestration across the other three modules) is the next module being built. Authentication is currently mock/in-memory only.
