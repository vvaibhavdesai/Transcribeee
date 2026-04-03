"use client";

import { useState, useRef, useCallback, CSSProperties } from "react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "es", name: "Spanish" },
  { code: "pt", name: "Portuguese" },
  { code: "it", name: "Italian" },
  { code: "nl", name: "Dutch" },
  { code: "pl", name: "Polish" },
  { code: "el", name: "Greek" },
  { code: "ar", name: "Arabic" },
  { code: "zh", name: "Chinese" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "vi", name: "Vietnamese" },
];

const SUPPORTED_FORMATS = ["flac", "mp3", "mpeg", "mpga", "ogg", "wav"];

interface Analysis {
  summary: string;
  action_items: string[];
  topics: string[];
  sentiment: string;
  speakers: number;
  highlights: string[];
}

function formatBytes(b: number) {
  if (b < 1024) return b + " B";
  if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
  return (b / 1048576).toFixed(1) + " MB";
}

function formatDuration(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/* ─── Shared styles ─── */

const c = {
  bg: "#0c0c18",
  card: "rgba(22,22,40,0.85)",
  cardBorder: "rgba(255,255,255,0.06)",
  surface: "#0f0f1e",
  surfaceBorder: "rgba(255,255,255,0.08)",
  text: "#e4e4ed",
  textMuted: "#a1a1b5",
  textDim: "#6b6b80",
  textFaint: "#44445a",
  accent: "#39e58c",
  accentDim: "rgba(57,229,140,0.12)",
  purple: "#a78bfa",
  purpleDim: "rgba(167,139,250,0.12)",
  blue: "#60a5fa",
  blueDim: "rgba(96,165,250,0.12)",
  amber: "#fbbf24",
  amberDim: "rgba(251,191,36,0.12)",
  red: "#f87171",
  redDim: "rgba(248,113,113,0.12)",
};

const card: CSSProperties = {
  background: c.card,
  border: `1px solid ${c.cardBorder}`,
  borderRadius: 16,
  backdropFilter: "blur(24px)",
};

const label: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: c.textDim,
  textTransform: "uppercase",
  letterSpacing: "0.08em",
  marginBottom: 6,
  display: "block",
};

const input: CSSProperties = {
  width: "100%",
  background: c.surface,
  border: `1px solid ${c.surfaceBorder}`,
  borderRadius: 10,
  padding: "10px 14px",
  color: c.text,
  fontSize: 13,
  fontFamily: "'SF Mono', 'Fira Code', monospace",
  outline: "none",
  boxSizing: "border-box" as const,
};

const btnPrimary = (disabled: boolean): CSSProperties => ({
  padding: "11px 28px",
  borderRadius: 10,
  border: "none",
  fontWeight: 700,
  fontSize: 13,
  cursor: disabled ? "not-allowed" : "pointer",
  opacity: disabled ? 0.4 : 1,
  background: `linear-gradient(135deg, ${c.accent}, #3dc9b0)`,
  color: c.bg,
  letterSpacing: "0.01em",
  transition: "opacity 0.15s",
});

const badge = (color: string, bg: string): CSSProperties => ({
  display: "inline-flex",
  alignItems: "center",
  fontSize: 10,
  fontWeight: 700,
  padding: "3px 10px",
  borderRadius: 20,
  background: bg,
  color,
  letterSpacing: "0.04em",
});

const tab = (active: boolean, disabled: boolean): CSSProperties => ({
  flex: 1,
  padding: "9px 6px",
  textAlign: "center" as const,
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 600,
  cursor: disabled ? "default" : "pointer",
  border: "none",
  background: active ? "rgba(255,255,255,0.08)" : "transparent",
  color: active ? c.accent : disabled ? c.textFaint : c.textDim,
  transition: "all 0.15s",
});

/* ─── Audio Player ─── */

function AudioPlayer({ src, audioRef, onDuration }: { src: string; audioRef: React.RefObject<HTMLAudioElement | null>; onDuration: (d: number) => void }) {
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);
  const [vol, setVol] = useState(1);
  const barRef = useRef<HTMLDivElement>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const toggle = () => {
    if (!audioRef.current) return;
    if (playing) audioRef.current.pause();
    else audioRef.current.play();
    setPlaying(!playing);
  };

  const seek = (e: React.MouseEvent) => {
    if (!barRef.current || !audioRef.current) return;
    const rect = barRef.current.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    audioRef.current.currentTime = pct * dur;
    setCur(pct * dur);
  };

  return (
    <div style={{ marginTop: 14, padding: "12px 16px", background: c.surface, border: `1px solid ${c.surfaceBorder}`, borderRadius: 12, display: "flex", alignItems: "center", gap: 14 }}>
      <audio
        ref={audioRef}
        src={src}
        onLoadedMetadata={() => { const d = audioRef.current?.duration || 0; setDur(d); onDuration(d); }}
        onTimeUpdate={() => setCur(audioRef.current?.currentTime || 0)}
        onEnded={() => setPlaying(false)}
      />
      {/* Play/Pause */}
      <button onClick={toggle} style={{
        width: 34, height: 34, borderRadius: "50%", border: "none", cursor: "pointer",
        background: `linear-gradient(135deg, ${c.accent}, #3dc9b0)`,
        display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
      }}>
        {playing ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill={c.bg}><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill={c.bg}><path d="M6 4l14 8-14 8z"/></svg>
        )}
      </button>

      {/* Time */}
      <span style={{ fontSize: 11, fontFamily: "monospace", color: c.textDim, minWidth: 36, textAlign: "right" }}>{fmt(cur)}</span>

      {/* Progress bar */}
      <div ref={barRef} onClick={seek} style={{
        flex: 1, height: 6, background: "rgba(255,255,255,0.06)", borderRadius: 3, cursor: "pointer", position: "relative",
      }}>
        <div style={{
          height: "100%", borderRadius: 3, width: `${dur ? (cur / dur) * 100 : 0}%`,
          background: `linear-gradient(90deg, ${c.accent}, #3dc9b0)`,
          transition: "width 0.1s linear",
        }} />
        <div style={{
          position: "absolute", top: "50%", transform: "translate(-50%, -50%)",
          left: `${dur ? (cur / dur) * 100 : 0}%`,
          width: 12, height: 12, borderRadius: "50%",
          background: c.accent, border: `2px solid ${c.surface}`,
          boxShadow: `0 0 8px ${c.accentDim}`,
          transition: "left 0.1s linear",
        }} />
      </div>

      {/* Duration */}
      <span style={{ fontSize: 11, fontFamily: "monospace", color: c.textFaint, minWidth: 36 }}>{fmt(dur)}</span>

      {/* Volume */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <button onClick={() => { const nv = vol > 0 ? 0 : 1; setVol(nv); if (audioRef.current) audioRef.current.volume = nv; }}
          style={{ background: "none", border: "none", cursor: "pointer", display: "flex", padding: 0 }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={vol > 0 ? c.textDim : c.red} strokeWidth="2">
            {vol > 0 ? <><path d="M11 5L6 9H2v6h4l5 4z"/><path d="M19.07 4.93a10 10 0 010 14.14M15.54 8.46a5 5 0 010 7.07"/></> : <><path d="M11 5L6 9H2v6h4l5 4z"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></>}
          </svg>
        </button>
        <input type="range" min="0" max="1" step="0.05" value={vol}
          onChange={e => { const v = parseFloat(e.target.value); setVol(v); if (audioRef.current) audioRef.current.volume = v; }}
          style={{ width: 56, accentColor: c.accent, height: 4, cursor: "pointer" }}
        />
      </div>
    </div>
  );
}

/* ─── Component ─── */

export default function TranscribeIQ() {
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [lang, setLang] = useState("en");
  const [file, setFile] = useState<File | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [step, setStep] = useState<"idle" | "transcribing" | "analyzing" | "done">("idle");
  const [transcript, setTranscript] = useState("");
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("transcript");
  const [copied, setCopied] = useState("");
  const [showTooltip, setShowTooltip] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const handleFile = useCallback((f: File | null) => {
    if (!f) return;
    const ext = f.name.split(".").pop()?.toLowerCase() || "";
    if (!SUPPORTED_FORMATS.includes(ext)) {
      setError(`Unsupported format .${ext}. Use: ${SUPPORTED_FORMATS.join(", ")}`);
      return;
    }
    setError("");
    setFile(f);
    setAudioUrl(URL.createObjectURL(f));
    setTranscript("");
    setAnalysis(null);
    setStep("idle");
    setActiveTab("transcript");
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  }, [handleFile]);

  const analyzeTranscript = async (text: string) => {
    const prompt = `You are an expert analyst. Given the following transcript, produce a JSON object with these keys:
- "summary": A concise 3-5 sentence summary.
- "action_items": Array of action items (strings). If none, empty array.
- "topics": Array of key topics (strings, max 8).
- "sentiment": One of "positive","negative","neutral","mixed".
- "speakers": Estimated distinct speakers (integer).
- "highlights": Array of 2-4 notable quotes (strings).
Respond ONLY with valid JSON.

TRANSCRIPT:
${text.slice(0, 12000)}`;

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "x-api-key": apiKey, "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: prompt }] }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({}));
      throw new Error(d.message || `Analysis failed (${res.status})`);
    }
    const data = await res.json();
    const raw = data.message?.content?.[0]?.text || "";
    return JSON.parse(raw.replace(/```json|```/g, "").trim()) as Analysis;
  };

  const run = async () => {
    if (!apiKey) { setError("Enter your Cohere API key."); return; }
    if (!file) { setError("Upload an audio file."); return; }
    setError(""); setLoading(true); setStep("transcribing");
    setTranscript(""); setAnalysis(null);
    try {
      const fd = new FormData();
      fd.append("model", "cohere-transcribe-03-2026");
      fd.append("language", lang);
      fd.append("temperature", "0.2");
      fd.append("file", file);
      const res = await fetch("/api/transcribe", { method: "POST", headers: { "x-api-key": apiKey }, body: fd });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || `Transcription failed (${res.status})`);
      }
      const data = await res.json();
      const text = data.text || data.transcript || "";
      if (!text) throw new Error("Empty transcription.");
      setTranscript(text);
      setStep("analyzing");
      const a = await analyzeTranscript(text);
      setAnalysis(a);
      setStep("done");
      setActiveTab("summary");
    } catch (e: any) {
      setError(e.message);
      setStep("idle");
    } finally {
      setLoading(false);
    }
  };

  const copyText = (t: string, l: string) => {
    navigator.clipboard.writeText(t);
    setCopied(l);
    setTimeout(() => setCopied(""), 1500);
  };

  const exportAll = () => {
    let o = `# TranscribeIQ Report\n\n**File:** ${file?.name}\n**Language:** ${LANGUAGES.find(l => l.code === lang)?.name}\n**Date:** ${new Date().toLocaleString()}\n\n## Transcript\n\n${transcript}\n\n`;
    if (analysis) {
      o += `## Summary\n\n${analysis.summary}\n\n`;
      if (analysis.action_items?.length) o += `## Action Items\n\n${analysis.action_items.map((a, i) => `${i + 1}. ${a}`).join("\n")}\n\n`;
      if (analysis.topics?.length) o += `## Topics\n\n${analysis.topics.join(", ")}\n\n`;
      o += `## Sentiment: ${analysis.sentiment}\n## Speakers: ${analysis.speakers}\n\n`;
      if (analysis.highlights?.length) o += `## Highlights\n\n${analysis.highlights.map((h, i) => `${i + 1}. "${h}"`).join("\n")}\n`;
    }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([o], { type: "text/markdown" }));
    a.download = `transcribe-iq-${Date.now()}.md`;
    a.click();
  };

  const sentimentColor: Record<string, { fg: string; bg: string }> = {
    positive: { fg: c.accent, bg: c.accentDim },
    negative: { fg: c.red, bg: c.redDim },
    mixed: { fg: c.amber, bg: c.amberDim },
    neutral: { fg: c.textDim, bg: "rgba(255,255,255,0.05)" },
  };

  const PIPELINE = [
    { key: "transcribing", label: "Transcribe", model: "cohere-transcribe-03-2026" },
    { key: "analyzing", label: "Analyze", model: "command-a-03-2025" },
  ];

  const pipelineDone = (k: string) =>
    (k === "transcribing" && (step === "analyzing" || step === "done")) ||
    (k === "analyzing" && step === "done");

  const hasResults = transcript || analysis;

  return (
    <div style={{ minHeight: "100vh", background: c.bg, color: c.text, fontFamily: "'Inter', -apple-system, system-ui, sans-serif" }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        input:focus, select:focus { border-color: rgba(167,139,250,0.5) !important; }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.08); border-radius: 4px; }
        select option { background: #12121f; color: #e4e4ed; }
      `}</style>

      {/* BG blobs */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", zIndex: 0 }}>
        <div style={{ position: "absolute", top: -120, left: -100, width: 500, height: 500, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(140px)" }} />
        <div style={{ position: "absolute", bottom: -80, right: -60, width: 420, height: 420, borderRadius: "50%", background: "rgba(59,130,246,0.08)", filter: "blur(120px)" }} />
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 350, height: 350, borderRadius: "50%", background: "rgba(57,229,140,0.06)", filter: "blur(100px)", transform: "translate(-50%,-50%)" }} />
      </div>

      {/* Top bar */}
      <header style={{
        position: "sticky", top: 0, zIndex: 30,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px", height: 52,
        background: "rgba(12,12,24,0.7)", backdropFilter: "blur(20px)",
        borderBottom: `1px solid ${c.cardBorder}`,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${c.accent}, #3dc9b0)`,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 900, color: c.bg,
          }}>T</div>
          <span style={{ fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em" }}>TranscribeIQ</span>
          <span style={{ color: c.textFaint, fontSize: 13 }}>/</span>
          <span style={{ color: c.textDim, fontSize: 13 }}>Audio Pipeline</span>
          {/* <span style={badge(c.purple, c.purpleDim)}>NEW — MAR 2026</span> */}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {step === "done" && <span style={badge(c.accent, c.accentDim)}>COMPLETE</span>}
          <button style={btnPrimary(loading || !file || !apiKey)} disabled={loading || !file || !apiKey} onClick={run}>
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(12,12,24,0.3)", borderTop: "2px solid #0c0c18", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                {step === "transcribing" ? "Transcribing..." : "Analyzing..."}
              </span>
            ) : "Run Pipeline"}
          </button>
        </div>
      </header>

      {/* Main */}
      <div style={{ position: "relative", zIndex: 10, maxWidth: 1100, margin: "0 auto", padding: "28px 32px" }}>
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: c.redDim, border: `1px solid rgba(248,113,113,0.2)`, borderRadius: 12, padding: "10px 16px", color: c.red, fontSize: 13, marginBottom: 20 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 8v4m0 4h.01"/></svg>
            {error}
          </div>
        )}

        {/* Row 1: Config + Pipeline */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 20, marginBottom: 20 }}>
          {/* Config */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${c.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>Configuration</span>
              <span style={badge(c.textDim, "rgba(255,255,255,0.04)")}>STEP 1</span>
            </div>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                  <label style={{ ...label, marginBottom: 0 }}>API Key</label>
                  <div
                    style={{ position: "relative", display: "inline-flex" }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" style={{ color: c.textDim, cursor: "default", flexShrink: 0 }}>
                      <circle cx="8" cy="8" r="7.5" stroke="currentColor" strokeWidth="1"/>
                      <text x="8" y="12" textAnchor="middle" fill="currentColor" fontSize="10" fontWeight="700" fontFamily="sans-serif">i</text>
                    </svg>
                    {showTooltip && (
                      <div style={{
                        position: "absolute",
                        bottom: "calc(100% + 8px)",
                        left: "50%",
                        transform: "translateX(-50%)",
                        background: "rgba(22,22,40,0.97)",
                        border: `1px solid rgba(255,255,255,0.12)`,
                        borderRadius: 8,
                        padding: "8px 12px",
                        fontSize: 12,
                        color: c.textMuted,
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
                        zIndex: 100,
                        boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
                        lineHeight: 1.5,
                      }}>
                        We don&apos;t store your API key, it&apos;s used directly<br />to call the Cohere API endpoint. You can clone the project and run it locally for full control. Get your API key from the Cohere dashboard.
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ position: "relative" }}>
                  <input style={input} type={showKey ? "text" : "password"} placeholder="Paste your Cohere API key" value={apiKey} onChange={e => setApiKey(e.target.value)} />
                  <button onClick={() => setShowKey(!showKey)} style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", color: c.textDim, cursor: "pointer", fontSize: 11, fontWeight: 600 }}>
                    {showKey ? "HIDE" : "SHOW"}
                  </button>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={label}>Language</label>
                  <select style={{ ...input, fontFamily: "inherit" }} value={lang} onChange={e => setLang(e.target.value)}>
                    {LANGUAGES.map(l => <option key={l.code} value={l.code}>{l.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={label}>Temperature</label>
                  <input style={{ ...input, color: c.textDim }} value="0.2" readOnly />
                </div>
              </div>
            </div>
          </div>

          {/* Pipeline / Properties */}
          <div style={card}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${c.cardBorder}` }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>Properties</span>
              <span style={{ fontSize: 10, fontFamily: "monospace", color: c.textDim }}>
                status: <span style={{ color: step === "done" ? c.accent : step === "idle" ? c.textFaint : c.amber }}>{step}</span>
              </span>
            </div>
            <div style={{ padding: 16 }}>
              {PIPELINE.map((p) => {
                const active = step === p.key;
                const done = pipelineDone(p.key);
                return (
                  <div key={p.key} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: 12, borderRadius: 12, marginBottom: 8,
                    border: `1px solid ${active ? "rgba(167,139,250,0.3)" : done ? "rgba(57,229,140,0.15)" : c.cardBorder}`,
                    background: active ? "rgba(167,139,250,0.06)" : done ? "rgba(57,229,140,0.04)" : "rgba(255,255,255,0.015)",
                  }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700,
                      background: active ? c.purpleDim : done ? c.accentDim : "rgba(255,255,255,0.04)",
                      color: active ? c.purple : done ? c.accent : c.textDim,
                    }}>
                      {done ? (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M20 6 9 17l-5-5"/></svg>
                      ) : active ? (
                        <span style={{ display: "inline-block", width: 14, height: 14, border: `2px solid ${c.purple}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.6s linear infinite" }} />
                      ) : (
                        <span style={{ fontSize: 11 }}>{p.key === "transcribing" ? "ASR" : "LLM"}</span>
                      )}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, color: c.text }}>{p.label}</div>
                      <div style={{ fontSize: 10, color: c.textFaint, fontFamily: "monospace", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.model}</div>
                    </div>
                  </div>
                );
              })}

              <div style={{ marginTop: 12, paddingTop: 12, borderTop: `1px solid ${c.cardBorder}` }}>
                <div style={{ fontSize: 10, color: c.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 4 }}>Description</div>
                <div style={{ fontSize: 12, color: c.textDim, lineHeight: 1.6 }}>
                  Transcribe audio via Cohere ASR, then extract structured insights with Command A.
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Upload */}
        <div style={{ ...card, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: `1px solid ${c.cardBorder}` }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>Audio Input</span>
            <span style={badge(c.textDim, "rgba(255,255,255,0.04)")}>STEP 2</span>
          </div>
          <div style={{ padding: 20 }}>
            <div
              style={{
                border: `2px dashed ${dragging ? "rgba(57,229,140,0.5)" : c.surfaceBorder}`,
                borderRadius: 14, padding: "44px 24px", textAlign: "center", cursor: "pointer",
                background: dragging ? "rgba(57,229,140,0.03)" : "transparent",
                transition: "all 0.2s",
              }}
              onDragOver={e => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
            >
              <input ref={fileRef} type="file" accept=".flac,.mp3,.mpeg,.mpga,.ogg,.wav" style={{ display: "none" }} onChange={e => handleFile(e.target.files?.[0] || null)} />
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={c.textDim} strokeWidth="1.5" style={{ margin: "0 auto 12px" }}>
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
              </svg>
              <div style={{ fontSize: 14, fontWeight: 600, color: c.textMuted }}>
                {dragging ? "Drop audio file here" : "Drag & drop audio or click to browse"}
              </div>
              <div style={{ fontSize: 11, color: c.textFaint, marginTop: 6 }}>
                Supported: {SUPPORTED_FORMATS.join(", ")}
              </div>
            </div>

            {file && (
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginTop: 16, padding: 14, background: c.surface, borderRadius: 12, border: `1px solid ${c.cardBorder}` }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: c.purpleDim, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke={c.purple} strokeWidth="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                  <div style={{ fontSize: 11, color: c.textDim, marginTop: 2 }}>
                    {formatBytes(file.size)}{duration ? ` · ${formatDuration(duration)}` : ""} · {LANGUAGES.find(l => l.code === lang)?.name}
                  </div>
                </div>
                <button onClick={() => { setFile(null); setAudioUrl(null); setTranscript(""); setAnalysis(null); setStep("idle"); }}
                  style={{ background: "none", border: "none", color: c.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                  REMOVE
                </button>
              </div>
            )}

            {audioUrl && <AudioPlayer src={audioUrl} audioRef={audioRef} onDuration={setDuration} />}
          </div>
        </div>

        {/* Row 3: Results */}
        {hasResults && (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
            {/* Main results */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 20px", borderBottom: `1px solid ${c.cardBorder}` }}>
                <div style={{ display: "flex", gap: 4 }}>
                  {[
                    { id: "transcript", label: "Transcript" },
                    { id: "summary", label: "Summary", needs: !!analysis },
                    { id: "actions", label: "Actions", needs: !!analysis },
                    { id: "insights", label: "Insights", needs: !!analysis },
                  ].map(t => (
                    <button key={t.id} disabled={t.needs === false} onClick={() => t.needs !== false && setActiveTab(t.id)}
                      style={tab(activeTab === t.id, t.needs === false)}>
                      {t.label}
                    </button>
                  ))}
                </div>
                <div style={{ display: "flex", gap: 10 }}>
                  <button onClick={() => copyText(transcript, "t")} style={{ background: "none", border: "none", color: c.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    {copied === "t" ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={exportAll} style={{ background: "none", border: "none", color: c.textDim, fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                    Export
                  </button>
                </div>
              </div>

              <div style={{ padding: 20 }}>
                {activeTab === "transcript" && (
                  <div>
                    <pre style={{ background: c.surface, borderRadius: 12, padding: 18, fontSize: 13, lineHeight: 1.8, whiteSpace: "pre-wrap", wordBreak: "break-word", maxHeight: 420, overflow: "auto", color: c.textMuted, border: `1px solid ${c.cardBorder}`, fontFamily: "'SF Mono', 'Fira Code', monospace" }}>
                      {transcript}
                    </pre>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10 }}>
                      <span style={{ fontSize: 11, color: c.textFaint }}>{transcript.split(/\s+/).length} words</span>
                      <span style={badge(c.accent, c.accentDim)}>cohere-transcribe-03-2026</span>
                    </div>
                  </div>
                )}

                {activeTab === "summary" && analysis && (
                  <div>
                    <div style={{ fontSize: 14, lineHeight: 1.85, color: c.textMuted }}>{analysis.summary}</div>
                    {analysis.highlights?.length > 0 && (
                      <div style={{ marginTop: 20 }}>
                        <div style={label}>Highlights</div>
                        {analysis.highlights.map((h, i) => (
                          <div key={i} style={{ paddingLeft: 16, paddingTop: 10, paddingBottom: 10, borderLeft: `2px solid rgba(57,229,140,0.3)`, background: "rgba(57,229,140,0.03)", borderRadius: "0 8px 8px 0", marginBottom: 8, fontSize: 13, color: c.textDim, fontStyle: "italic" }}>
                            &ldquo;{h}&rdquo;
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "actions" && analysis && (
                  <div>
                    {analysis.action_items?.length > 0 ? (
                      analysis.action_items.map((a, i) => (
                        <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", padding: 12, borderRadius: 10, background: "rgba(255,255,255,0.015)", border: `1px solid ${c.cardBorder}`, marginBottom: 8 }}>
                          <div style={{ width: 22, height: 22, borderRadius: 6, background: c.accentDim, color: c.accent, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                          <span style={{ fontSize: 13, color: c.textMuted, lineHeight: 1.6 }}>{a}</span>
                        </div>
                      ))
                    ) : (
                      <div style={{ textAlign: "center", padding: 40, color: c.textFaint, fontSize: 13 }}>No action items identified.</div>
                    )}
                  </div>
                )}

                {activeTab === "insights" && analysis && (
                  <div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                      {[
                        { label: "Sentiment", value: <span style={badge(sentimentColor[analysis.sentiment]?.fg || c.textDim, sentimentColor[analysis.sentiment]?.bg || "rgba(255,255,255,0.05)")}>{analysis.sentiment?.toUpperCase()}</span> },
                        { label: "Speakers", value: <span style={{ fontSize: 24, fontWeight: 700 }}>{analysis.speakers || "—"}</span> },
                        { label: "Words", value: <span style={{ fontSize: 24, fontWeight: 700 }}>{transcript.split(/\s+/).length}</span> },
                        { label: "Language", value: <span style={{ fontSize: 18, fontWeight: 700 }}>{LANGUAGES.find(l => l.code === lang)?.name}</span> },
                      ].map((s, i) => (
                        <div key={i} style={{ background: c.surface, borderRadius: 12, padding: 16, border: `1px solid ${c.cardBorder}` }}>
                          <div style={{ fontSize: 10, color: c.textFaint, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 8 }}>{s.label}</div>
                          {s.value}
                        </div>
                      ))}
                    </div>
                    {analysis.topics?.length > 0 && (
                      <div>
                        <div style={label}>Topics</div>
                        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                          {analysis.topics.map((t, i) => <span key={i} style={badge(c.blue, c.blueDim)}>{t}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Live logs */}
            <div style={card}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 16px", borderBottom: `1px solid ${c.cardBorder}` }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: c.textMuted }}>Execution Logs</span>
                <span style={{ fontSize: 10, fontFamily: "monospace", color: c.textFaint }}>v1.0</span>
              </div>
              <div style={{ padding: 16 }}>
                {["TRIGGER", "TRANSCRIBE", "ANALYZE", ...(analysis ? ["INSIGHTS"] : [])].map((s, i) => {
                  const active = i <= (step === "done" ? 3 : step === "analyzing" ? 2 : 1);
                  return (
                    <div key={s} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}>
                      <div style={{ width: 6, height: 6, borderRadius: "50%", background: active ? c.accent : c.textFaint, boxShadow: active ? `0 0 8px ${c.accentDim}` : "none" }} />
                      <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, color: active ? c.accent : c.textFaint }}>{s}</span>
                    </div>
                  );
                })}

                {analysis && (
                  <div style={{ marginTop: 16, paddingTop: 14, borderTop: `1px solid ${c.cardBorder}` }}>
                    <div style={{ fontSize: 10, color: c.textFaint, marginBottom: 8 }}>Processing node: Analyze Transcript</div>
                    <pre style={{
                      background: "#0a0a14", borderRadius: 10, padding: 14,
                      fontSize: 11, fontFamily: "'SF Mono', 'Fira Code', monospace",
                      lineHeight: 1.7, overflow: "auto", maxHeight: 260,
                      border: `1px solid ${c.cardBorder}`,
                    }}>
                      <span style={{ color: c.textFaint }}>{"{"}</span>{"\n"}
                      <span style={{ color: c.purple }}>  &quot;sentiment&quot;</span>: <span style={{ color: c.accent }}>&quot;{analysis.sentiment}&quot;</span>,{"\n"}
                      <span style={{ color: c.purple }}>  &quot;speakers&quot;</span>: <span style={{ color: c.amber }}>{analysis.speakers}</span>,{"\n"}
                      <span style={{ color: c.purple }}>  &quot;topics&quot;</span>: [<span style={{ color: c.accent }}>{analysis.topics?.slice(0, 3).map(t => `"${t}"`).join(", ")}</span>],{"\n"}
                      <span style={{ color: c.purple }}>  &quot;action_items&quot;</span>: <span style={{ color: c.amber }}>{analysis.action_items?.length} items</span>,{"\n"}
                      <span style={{ color: c.purple }}>  &quot;highlights&quot;</span>: <span style={{ color: c.amber }}>{analysis.highlights?.length} items</span>{"\n"}
                      <span style={{ color: c.textFaint }}>{"}"}</span>
                    </pre>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 36, paddingTop: 20, borderTop: `1px solid ${c.cardBorder}` }}>
          <div style={{ fontSize: 11, color: c.textFaint }}>TranscribeIQ — Built with Cohere Transcribe & Command A</div>
        </div>
      </div>
    </div>
  );
}