# 🎙️ TranscribeIQ

**Audio intelligence powered by Cohere's newest models.**

TranscribeIQ is a full-stack audio analysis app that combines [Cohere Transcribe](https://cohere.com/blog/transcribe) (launched March 26, 2026) with [Command A](https://docs.cohere.com/docs/command-a) to turn any audio file into structured, actionable insights transcription, summarization, action items, topic extraction, and sentiment analysis.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Cohere](https://img.shields.io/badge/Cohere-Transcribe%20%2B%20Command%20A-39e58c)
![License](https://img.shields.io/badge/License-MIT-blue)

---

## Why This Exists

Cohere Transcribe is a 2B-parameter ASR model that ranks **#1 on HuggingFace's Open ASR Leaderboard** with a 5.42% WER beating Whisper, ElevenLabs Scribe, IBM Granite, and Qwen ASR. It supports 14 languages and processes 525 minutes of audio per minute.

TranscribeIQ is one of the first apps built on this model, combining it with Command A's reasoning capabilities to go beyond raw transcription into genuine audio intelligence.

---

## Features

- **Drag-and-drop audio upload** — supports `.flac`, `.mp3`, `.mpeg`, `.mpga`, `.ogg`, `.wav`
- **14 languages** — English, French, German, Spanish, Portuguese, Italian, Dutch, Polish, Greek, Arabic, Chinese, Japanese, Korean, Vietnamese
- **AI-powered analysis via Command A** — summary, action items, key topics, sentiment, speaker estimation, highlights
- **Audio preview** — built-in player with duration detection
- **Export** — download a full Markdown report of transcript + analysis
- **Pipeline visualization** — real-time step tracking (Upload → Transcribe → Analyze → Done)

---

## Tech Stack

| Layer     | Technology                          |
| --------- | ----------------------------------- |
| Framework | Next.js 15 (App Router)             |
| Frontend  | React 19, Tailwind CSS              |
| ASR       | `cohere-transcribe-03-2026`         |
| LLM       | `command-a-03-2025` (111B, 256K ctx)|
| Deploy    | Vercel                              |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A free Cohere API key → [dashboard.cohere.com](https://dashboard.cohere.com)

### Setup

```bash
# Clone
git clone https://github.com/<your-username>/transcribe-iq.git
cd transcribe-iq

# Install
npm install

# Run
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your Cohere API key, upload audio, and go.

### Environment Variables (optional)

If you want to hardcode the API key server-side instead of passing it from the client:

```env
# .env.local
COHERE_API_KEY=your_key_here
```

---

## Project Structure

```
transcribe-iq/
├── app/
│   ├── page.tsx                # Main UI — upload, transcribe, results
│   ├── layout.tsx              # Root layout
│   └── api/
│       ├── transcribe/
│       │   └── route.ts        # Proxy → Cohere Transcribe API
│       └── analyze/
│           └── route.ts        # Proxy → Cohere Command A Chat API
├── public/
├── .env.local
├── package.json
├── tailwind.config.ts
└── README.md
```

---

## How It Works

```
┌──────────┐     ┌──────────────────────┐     ┌──────────────────┐
│  Audio   │────▶│  Cohere Transcribe   │────▶│   Command A      │
│  Upload  │     │  (ASR, 2B params)    │     │   (111B, Chat)   │
└──────────┘     └──────────────────────┘     └──────────────────┘
                        │                            │
                   Raw Transcript              Structured JSON
                                          ┌──────────────────────┐
                                          │ • Summary            │
                                          │ • Action Items       │
                                          │ • Key Topics         │
                                          │ • Sentiment          │
                                          │ • Speaker Count      │
                                          │ • Highlights         │
                                          └──────────────────────┘
```

1. **Upload** — user drops an audio file (up to 14 supported formats)
2. **Transcribe** — audio is sent to `POST /v2/audio/transcriptions` via server-side proxy
3. **Analyze** — transcript is piped to Command A with structured JSON output via `POST /v2/chat`
4. **Display** — results rendered across four tabs with copy/export

---

## API Endpoints Used

| Endpoint | Model | Purpose |
| --- | --- | --- |
| `POST /v2/audio/transcriptions` | `cohere-transcribe-03-2026` | Speech-to-text |
| `POST /v2/chat` | `command-a-03-2025` | Summarization, extraction, analysis |

---

## Deploy to Vercel

```bash
npm i -g vercel
vercel deploy
```

Or connect the GitHub repo to [vercel.com](https://vercel.com) for auto-deploys on push.

---

## Why Cohere?

I chose Cohere's stack specifically because:

- **Transcribe is best-in-class** — #1 on the Open ASR Leaderboard, open-weights, production-efficient (3x faster RTFx than comparable models)
- **Command A is built for tool use and structured output** — `response_format: { type: "json_object" }` makes extraction pipelines trivial
- **Multilingual by default** — 14 languages on Transcribe, 23 on Command A, no separate models needed
- **Enterprise-ready** — Model Vault for private inference, SOC 2 compliant, on-prem deployment options

This isn't just "LLM wrapper" — it's a pipeline that exercises two differentiated Cohere products working together.

---

## License

MIT

---

**Built by [Your Name]** — [your-email] · [linkedin] · [github]