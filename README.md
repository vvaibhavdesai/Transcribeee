# 🎙️ TranscribeIQ

**Audio intelligence powered by Cohere's newest models.**

TranscribeIQ is a full-stack audio analysis app that combines [Cohere Transcribe](https://cohere.com/blog/transcribe) (launched March 26, 2026) with [Command A](https://docs.cohere.com/docs/command-a) to turn any audio file into structured, actionable insights transcription, summarization, action items, topic extraction, and sentiment analysis.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)
![Cohere](https://img.shields.io/badge/Cohere-Transcribe%20%2B%20Command%20A-39e58c)
![License](https://img.shields.io/badge/License-MIT-blue)

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


## License

MIT

---

**Built by [Vaibhav Desai]** — [desai.vaibhav.dx@gmail.com] 
