# Behavioral Answer Generator

An AI-powered tool that helps you practice behavioral interview questions using GPT.  
Built with React, TypeScript, and OpenAI's chat completions API with streaming support.

---

## Features

- Ask behavioral interview questions (e.g. "Tell me about a time you failed")
- AI responds in STAR format (Situation, Task, Action, Result)
- Support for follow-up prompts like `next`, `elaborate`, `shorter`
- Say `reset` to restart the session from scratch
- Real-time streaming response
- Handles token cutoff with `👉 Continue?` UX
- Built-in request cancellation using `AbortController`
- Fully client-side, no backend needed

---

## Demo


---

## 🛠️ Tech Stack

| Category       | Tool / Framework         |
|----------------|--------------------------|
| Frontend       | React, TypeScript, Vite  |
| Styling        | Basic CSS or Tailwind (optional) |
| AI API         | OpenAI GPT-3.5-Turbo (stream mode) |
| State Handling | React `useState` + message history |
| Optimization   | `React.memo`, `AbortController` |

---

## Getting Started

```bash
git clone
cd interview-ai
npm install
npm run dev

Create a .env file in the root with your OpenAI API key:
VITE_OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxx

Enter question like
"Tell me about a time you resolved a conflict."

next
elaborate
shorter
reset
continue
```