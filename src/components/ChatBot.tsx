import React, { useEffect, useRef, useState } from 'react';
import { BorrowerRecord, RiskGrade, TabType } from '../types';
import {
  PRIMARY_BORROWER,
  TOP_AT_RISK_BORROWERS,
  INITIAL_ALERTS,
  PORTFOLIO_MSME_EXPANDED,
} from '../data/mockData';
import { loadGoogleMaps, bandPinSymbol } from '../lib/googleMaps';

interface AssistantAction {
  label: string;
  tab?: TabType;
  borrower?: BorrowerRecord;
}

interface ChatMapPoint {
  lat: number;
  lng: number;
  name: string;
  verdict: string;
}

interface Message {
  id: number;
  role: 'user' | 'assistant';
  text: string;
  action?: AssistantAction;
  map?: ChatMapPoint[];
  scoreMsmeId?: string;
}

interface AssistantReply {
  text: string;
  action?: AssistantAction;
}

const ALL_BORROWERS: BorrowerRecord[] = [PRIMARY_BORROWER, ...TOP_AT_RISK_BORROWERS];

const PIN_COLORS = ['#00685f', '#e11d48', '#2563eb', '#d97706'];

const BAND_COLORS: Record<RiskGrade, string> = {
  A: '#10b981',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  E: '#e11d48',
};

function ChatMiniMap({ points }: { points: ChatMapPoint[] }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let map: google.maps.Map | undefined;
    const markers: google.maps.Marker[] = [];
    let polyline: google.maps.Polyline | undefined;

    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current || points.length === 0) return;
      map = new google.maps.Map(containerRef.current, {
        zoom: 4,
        center: { lat: points[0].lat, lng: points[0].lng },
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      const info = new google.maps.InfoWindow();
      const bounds = new google.maps.LatLngBounds();
      points.forEach((p, i) => {
        const marker = new google.maps.Marker({
          position: { lat: p.lat, lng: p.lng },
          map,
          icon: bandPinSymbol(PIN_COLORS[i % PIN_COLORS.length], true),
          label: { text: String(i + 1), color: '#ffffff', fontSize: '11px', fontWeight: '700' },
          title: p.name,
        });
        marker.addListener('click', () => {
          info.setContent(
            `<div style="font-size:12px;max-width:200px;line-height:1.5"><b>${p.name}</b><br>${p.verdict}</div>`
          );
          info.open({ map, anchor: marker });
        });
        markers.push(marker);
        bounds.extend(marker.getPosition()!);
      });
      if (points.length > 1) {
        polyline = new google.maps.Polyline({
          path: points.map((p) => ({ lat: p.lat, lng: p.lng })),
          strokeColor: '#00685f',
          strokeOpacity: 0,
          strokeWeight: 2,
          icons: [
            {
              icon: { path: 'M 0,-1 0,1', strokeColor: '#00685f', strokeOpacity: 0.8, scale: 2.5 },
              offset: '0',
              repeat: '10px',
            },
          ],
          map,
        });
      }
      map.fitBounds(bounds, 32);
    });

    return () => {
      cancelled = true;
      markers.forEach((m) => m.setMap(null));
      polyline?.setMap(null);
      map = undefined;
    };
  }, [points]);

  return (
    <div
      ref={containerRef}
      className="h-[200px] w-full rounded-xl border border-[#bcc9c6]/50 bg-[#e8f0ec] overflow-hidden"
    />
  );
}

function ScoreAnalysisCard({ b }: { b: BorrowerRecord }) {
  const MIN = 300;
  const MAX = 900;
  const frac = (s: number) => Math.max(0, Math.min(1, (s - MIN) / (MAX - MIN)));
  const R = 62;
  const ARC = Math.PI * R;
  const color = BAND_COLORS[b.riskBand];
  const adjFrac = frac(b.climateAdjustedScore);
  const baseFrac = frac(b.baseCreditScore);
  const pdDelta = b.adjustedPdPercent - b.basePdPercent;
  const band = b.riskBand;

  return (
    <div className="w-[330px] bg-white border border-[#bcc9c6]/50 rounded-2xl p-3.5 shadow-xs">
      {/* Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <div className="text-[12.5px] font-bold text-[#0b1c30] leading-tight">{b.name}</div>
          <div className="font-mono text-[10px] text-[#6d7a77] mt-0.5">
            {b.msmeId} • {b.district}, {b.state}
          </div>
        </div>
        <span
          className="shrink-0 font-mono text-[10px] font-bold text-white px-2 py-1 rounded-full"
          style={{ background: color }}
        >
          Band {band} • {b.riskCategory}
        </span>
      </div>

      {/* Gauge */}
      <div className="relative">
        <svg viewBox="0 0 156 92" className="w-[150px] h-[88px] mx-auto block">
          <path d="M 16 78 A 62 62 0 0 1 140 78" fill="none" stroke="#e8ecf1" strokeWidth="11" strokeLinecap="round" />
          <path
            d="M 16 78 A 62 62 0 0 1 140 78"
            fill="none"
            stroke={color}
            strokeWidth="11"
            strokeLinecap="round"
            strokeDasharray={`${ARC * adjFrac} ${ARC}`}
          />
          <path
            d="M 16 78 A 62 62 0 0 1 140 78"
            fill="none"
            stroke="#0b1c30"
            strokeWidth="2.5"
            strokeDasharray={`2.5 ${ARC - 2.5}`}
            strokeDashoffset={`${-ARC * baseFrac}`}
          />
          <text x="78" y="72" textAnchor="middle" fontSize="26" fontWeight="800" fill="#0b1c30">
            {b.climateAdjustedScore}
          </text>
          <text x="118" y="72" textAnchor="middle" fontSize="9" fill="#6d7a77">
            /900
          </text>
        </svg>
        <div className="text-center font-mono text-[10px] text-[#6d7a77]">
          base {b.baseCreditScore} <span className="text-[#e11d48] font-semibold">−{b.climateDragPoints} pts (−{b.climateDragPercent}%)</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-1.5 mt-2.5">
        <div className="border border-[#bcc9c6]/30 rounded-lg px-2.5 py-1.5 bg-[#f8f9ff]">
          <div className="font-mono text-[9px] uppercase text-[#565e74]">12-Month PD</div>
          <div className="text-[12px] font-semibold text-[#0b1c30] mt-0.5">
            {b.basePdPercent}% → <span className="text-[#e11d48]">{b.adjustedPdPercent}%</span>
            <span className="font-mono text-[10px] text-[#e11d48] ml-1">+{pdDelta.toFixed(2)}pp</span>
          </div>
        </div>
        <div className="border border-[#bcc9c6]/30 rounded-lg px-2.5 py-1.5 bg-[#f8f9ff]">
          <div className="font-mono text-[9px] uppercase text-[#565e74]">Revenue at Risk</div>
          <div className="text-[12px] font-semibold text-[#0b1c30] mt-0.5">
            ₹{formatCr(b.revenueAtRiskCr)} Cr
            <span className="font-mono text-[10px] text-[#565e74] ml-1">({b.revenueAtRiskPercent}%)</span>
          </div>
        </div>
        <div className="border border-[#bcc9c6]/30 rounded-lg px-2.5 py-1.5 bg-[#f8f9ff]">
          <div className="font-mono text-[9px] uppercase text-[#565e74]">Facility</div>
          <div className="text-[12px] font-semibold text-[#0b1c30] mt-0.5">
            ₹{formatCr(b.facilityAmountCr)} Cr
            <span className="font-mono text-[10px] text-[#565e74] ml-1">{b.facilityType} · {b.tenorMonths}mo</span>
          </div>
        </div>
        <div className="border border-[#bcc9c6]/30 rounded-lg px-2.5 py-1.5 bg-[#f8f9ff]">
          <div className="font-mono text-[9px] uppercase text-[#565e74]">Turnover</div>
          <div className="text-[12px] font-semibold text-[#0b1c30] mt-0.5">₹{formatCr(b.annualTurnoverCr)} Cr</div>
        </div>
      </div>

      {/* Hazard drivers */}
      <div className="flex flex-wrap gap-1 mt-2">
        <span className="font-mono text-[9.5px] bg-rose-50 text-rose-800 border border-rose-200 rounded px-1.5 py-0.5">
          Flood {b.floodDepthModeledM}m
        </span>
        <span className="font-mono text-[9.5px] bg-sky-50 text-sky-800 border border-sky-200 rounded px-1.5 py-0.5">
          {b.waterbodyName}
        </span>
        <span className="font-mono text-[9.5px] bg-amber-50 text-amber-800 border border-amber-200 rounded px-1.5 py-0.5">
          Buffer {b.riverBufferDistanceM}m
        </span>
        <span className="font-mono text-[9.5px] bg-slate-100 text-slate-700 border border-slate-200 rounded px-1.5 py-0.5">
          Downtime {b.supplyRouteDowntimeDays}d
        </span>
        <span className="font-mono text-[9.5px] bg-emerald-50 text-emerald-800 border border-emerald-200 rounded px-1.5 py-0.5">
          Elev {b.elevationMsl}m
        </span>
      </div>

      {/* Pricing recommendation */}
      <div
        className="mt-2 rounded-lg px-2.5 py-1.5 flex items-center gap-1.5 border"
        style={{ background: `${color}12`, borderColor: `${color}40` }}
      >
        <span className="material-symbols-outlined text-[14px]" style={{ color }}>
          payments
        </span>
        <span className="text-[11px] font-semibold" style={{ color: '#0b1c30' }}>
          +{b.recommendedSpreadAdjustmentBps} bps spread · {b.recommendedCovenants.length} covenant(s)
        </span>
      </div>
    </div>
  );
}

const LANGUAGES: { code: string; label: string }[] = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'mr', label: 'मराठी' },
  { code: 'te', label: 'తెలుగు' },
  { code: 'ta', label: 'தமிழ்' },
  { code: 'bn', label: 'বাংলা' },
];

const SUGGESTIONS = [
  'Top risks today',
  'UP vs AP rice lending?',
  'Summarise alerts',
  'Portfolio summary',
  'How is the score calculated?',
];

function formatCr(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(1);
}

function borrowerReply(b: BorrowerRecord): AssistantReply {
  const text =
    `${b.name} (${b.msmeId})\n` +
    `${b.sector} • ${b.location}\n\n` +
    `Base score ${b.baseCreditScore} → climate-adjusted ${b.climateAdjustedScore} ` +
    `(−${b.climateDragPoints} pts, −${b.climateDragPercent}%)\n` +
    `PD: ${b.basePdPercent}% → ${b.adjustedPdPercent}% • Band ${b.riskBand} (${b.riskCategory})\n` +
    `Revenue at risk: ₹${formatCr(b.revenueAtRiskCr)} Cr (${b.revenueAtRiskPercent}% of turnover)\n` +
    `Modelled flood depth: ${b.floodDepthModeledM} m • Supply downtime: ${b.supplyRouteDowntimeDays} days\n\n` +
    `Recommended action: +${b.recommendedSpreadAdjustmentBps} bps spread adjustment ` +
    `with ${b.recommendedCovenants.length} climate covenant(s).`;
  return {
    text,
    action: { label: 'Open borrower file', tab: 'borrowers', borrower: b },
  };
}

function alertsReply(): AssistantReply {
  const fresh = INITIAL_ALERTS.filter((a) => a.column === 'new');
  const exposure = fresh.reduce((s, a) => s + a.exposureAtRiskCr, 0);
  const lines = fresh
    .map(
      (a) =>
        `• ${a.severity} — ${a.title} (${a.borrowerCount} borrowers, ₹${formatCr(a.exposureAtRiskCr)} Cr) → ${a.recommendedAction}`
    )
    .join('\n');
  const text =
    `${INITIAL_ALERTS.length} climate alerts on the board, ${fresh.length} awaiting first review.\n` +
    `New-alert exposure at risk: ₹${formatCr(exposure)} Cr.\n\n${lines}`;
  return { text, action: { label: 'Open Alerts board', tab: 'alerts' } };
}

function portfolioReply(): AssistantReply {
  const totalExposure = PORTFOLIO_MSME_EXPANDED.reduce((s, x) => s + x.exposureCr, 0);
  const stressedEl = PORTFOLIO_MSME_EXPANDED.reduce((s, x) => s + x.stressedElCr, 0);
  const top = [...PORTFOLIO_MSME_EXPANDED].sort((a, b) => b.riskScore - a.riskScore)[0];
  const text =
    `Portfolio snapshot (${PORTFOLIO_MSME_EXPANDED.length} tracked concentrations):\n` +
    `• Total exposure: ₹${formatCr(totalExposure)} Cr\n` +
    `• Stressed expected loss: ₹${formatCr(stressedEl)} Cr\n` +
    `• Highest climate risk: ${top.name} (${top.district}) — score ${top.riskScore}, peril: ${top.peril}, ${top.mitigationStatus}\n\n` +
    `Run SSP2-4.5 / SSP5-8.5 stress scenarios for the full VaR and CET1 impact.`;
  return { text, action: { label: 'Open Portfolio analytics', tab: 'portfolio' } };
}

function topRisksReply(): AssistantReply {
  const sorted = [...ALL_BORROWERS].sort((a, b) => b.climateDragPoints - a.climateDragPoints).slice(0, 3);
  const lines = sorted
    .map(
      (b, i) =>
        `${i + 1}. ${b.name} — climate drag −${b.climateDragPoints} pts, ` +
        `PD ${b.basePdPercent}% → ${b.adjustedPdPercent}%, ₹${formatCr(b.revenueAtRiskCr)} Cr revenue at risk`
    )
    .join('\n');
  const text = `Largest climate penalties in the book today:\n\n${lines}`;
  return { text, action: { label: 'Open Borrower console', tab: 'borrowers', borrower: sorted[0] } };
}

function methodologyReply(): AssistantReply {
  const text =
    `Climoid overlays climate hazard on your base credit decision:\n\n` +
    `PD^c = Φ( Φ⁻¹(PD⁰) + λ · CLR )\n\n` +
    `1. Hazard engine — flood (Gumbel on river discharge), heat, drought (SPI), storm exceedance.\n` +
    `2. Vulnerability & downtime — sector baseline, asset attributes, grid fragility, buffers.\n` +
    `3. Climate Loss Ratio (CLR) — expected share of annual revenue lost per year.\n` +
    `4. Probit shift — CLR reduces distance-to-default; high operating leverage amplifies it.\n` +
    `5. Scoring — CRS 0–100 with bands A–E; ΔEL drives risk-based pricing in bps.\n\n` +
    `The same balance sheet gets a different score in a different climate.`;
  return { text, action: { label: 'Read the framework (README)', tab: 'dashboard' } };
}

function crsBandsReply(): AssistantReply {
  const text =
    `Climate Resilience Score (0–100, higher is safer):\n\n` +
    `A ≥ 80 — Low climate risk\n` +
    `B 65–80 — Moderate\n` +
    `C 50–65 — Elevated: price or condition the loan\n` +
    `D 35–50 — High: insurance or restructuring conditions\n` +
    `E < 35 — Severe: escalate\n\n` +
    `Every borrower card also shows the climate penalty ΔS on the credit-style score.`;
  return { text };
}

function hazardReply(query: string): AssistantReply {
  const hazards: Record<string, { name: string; blurb: string }> = {
    flood: { name: 'Flood', blurb: 'Gumbel return levels on river discharge (GloFAS via Open-Meteo) + HAND/elevation susceptibility. 10-yr return period is the default trigger.' },
    heat: { name: 'Heat', blurb: 'Heatwave = apparent temperature above the local 95th percentile for ≥2 consecutive days. Grid-trip fragility lengthens downtime.' },
    drought: { name: 'Drought', blurb: 'SPI ≤ −1 on gamma-fitted precipitation over k months, with forecast uncertainty smoothing.' },
    storm: { name: 'Storm', blurb: 'Wind-gust exceedance above ~60 km/h via a logistic forecast-error smoothing.' },
  };
  const key = Object.keys(hazards).find((h) => query.includes(h));
  if (!key) return { text: 'Ask me about flood, heat, drought or storm hazards.' };
  const h = hazards[key];
  const count = INITIAL_ALERTS.filter((a) => a.category.toLowerCase() === key).length;
  const text =
    `${h.name} module:\n${h.blurb}\n\n` +
    `${count} active ${key} alert(s) on the board right now.`;
  return { text, action: { label: 'Open Alerts board', tab: 'alerts' } };
}

function generateReply(raw: string): AssistantReply {
  const q = raw.toLowerCase();

  const matched = ALL_BORROWERS.find(
    (b) =>
      q.includes(b.msmeId.toLowerCase()) ||
      q.includes(b.name.toLowerCase()) ||
      (b.name.split(' ')[0].length >= 6 && q.includes(b.name.split(' ')[0].toLowerCase()))
  );
  if (matched) return borrowerReply(matched);

  if (q.includes('top risk') || q.includes('biggest risk') || q.includes('worst')) return topRisksReply();
  if (q.includes('alert')) return alertsReply();
  if (q.includes('portfolio') || q.includes('exposure') || q.includes('concentration')) return portfolioReply();
  if (q.includes('scenario') || q.includes('stress') || q.includes('ssp') || q.includes('2050')) {
    return {
      text: 'The scenario engine uses CCKP CMIP6 delta-change: heat distributions shift by ΔT, flood Gumbel scales at ~7%/K (Clausius–Clapeyron), and precipitation rescales SPI. Compare SSP2-4.5 vs SSP5-8.5 across 2030/2040/2050.',
      action: { label: 'Open Scenarios', tab: 'scenarios' },
    };
  }
  if (q.includes('map') || q.includes('satellite') || q.includes('flood extent')) {
    return {
      text: 'The Map Explorer shows hazard layers with satellite-derived flood extent (Sentinel-1), basin boundaries and every borrower pinned by climate-adjusted score.',
      action: { label: 'Open Map Explorer', tab: 'map' },
    };
  }
  if (q.includes('crs') || q.includes('band') || q.includes('resilience score')) return crsBandsReply();
  if (q.includes('pd') || q.includes('methodolog') || q.includes('how') || q.includes('model') || q.includes('score')) {
    return methodologyReply();
  }
  if (q.includes('flood') || q.includes('heat') || q.includes('drought') || q.includes('storm')) {
    return hazardReply(q);
  }
  if (q.includes('help') || q.includes('what can you')) {
    return {
      text:
        `I'm the Climoid Risk Assistant. I can:\n` +
        `• Summarise any borrower's climate-adjusted risk\n` +
        `• Brief you on live alerts and exposure at risk\n` +
        `• Give portfolio and scenario snapshots\n` +
        `• Explain the scoring framework (PD, CRS, bands)\n` +
        `• Navigate you anywhere in the console\n\n` +
        `Try: "Sahyadri risk", "top risks today" or "portfolio summary".`,
    };
  }
  if (/^(hi|hello|hey)\b/.test(q)) {
    return { text: 'Hello. Ask me about borrowers, alerts, portfolio exposure, or how the climate-adjusted score works.' };
  }
  return {
    text:
      `I didn't catch that. Ask me about a borrower, live alerts, portfolio exposure, scenarios, or the scoring methodology — or tap a suggestion below.`,
  };
}

export function ChatBot({
  onNavigate,
  onSelectBorrower,
}: {
  onNavigate: (tab: TabType) => void;
  onSelectBorrower: (borrower: BorrowerRecord) => void;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [lang, setLang] = useState('en');
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  };

  const speak = async (text: string) => {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });
      if (!res.ok) throw new Error('tts-backend-failed');
      const blob = await res.blob();
      audioRef.current = new Audio(URL.createObjectURL(blob));
      audioRef.current.onended = () => setSpeaking(false);
      setSpeaking(true);
      await audioRef.current.play();
    } catch {
      if ('speechSynthesis' in window) {
        const u = new SpeechSynthesisUtterance(text.replace(/[•→▪]/g, ' '));
        u.onend = () => setSpeaking(false);
        u.onerror = () => setSpeaking(false);
        setSpeaking(true);
        window.speechSynthesis.speak(u);
      }
    }
  };

  const addAssistantMessage = (msg: {
    text: string;
    action?: AssistantAction;
    map?: ChatMapPoint[];
    scoreMsmeId?: string;
  }) => {
    setMessages((m) => [...m, { id: nextId.current++, role: 'assistant', ...msg }]);
    if (ttsEnabled) window.setTimeout(() => speak(msg.text), 50);
  };

  const transcribe = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': blob.type || 'audio/webm', 'x-language': lang },
        body: blob,
      });
      const data = (await res.json()) as { text?: string; error?: string };
      if (!res.ok || !data.text) {
        addAssistantMessage({ text: `Voice error: ${data.error || 'Transcription failed.'}` });
      } else {
        send(data.text);
      }
    } catch {
      addAssistantMessage({ text: 'Voice error: could not reach the voice backend. Is `npm run server` running on :3001?' });
    } finally {
      setTranscribing(false);
    }
  };

  const toggleRecording = async () => {
    if (recording) {
      mediaRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mr = new MediaRecorder(stream);
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mr.mimeType || 'audio/webm' });
        if (blob.size > 0) void transcribe(blob);
      };
      mr.start();
      mediaRecorderRef.current = mr;
      setRecording(true);
    } catch {
      addAssistantMessage({ text: 'Voice error: microphone access denied or unavailable.' });
    }
  };

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          id: nextId.current++,
          role: 'assistant',
          text:
            `Climoid Risk Assistant online — AI advisor with full knowledge of every borrower file, live alerts, ` +
            `portfolio exposure and the scoring methodology.\n\n` +
            `Ask me for lending recommendations, borrower defences, or committee-ready justifications. ` +
            `Tap the mic to speak (Whisper) or the speaker icon for spoken replies.`,
        },
      ]);
    }
  }, [open, messages.length]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  const send = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setMessages((m) => [...m, { id: nextId.current++, role: 'user', text }]);
    setInput('');
    setThinking(true);

    const history = [
      ...messages.map((m) => ({ role: m.role, content: m.text })),
      { role: 'user' as const, content: text },
    ];

    const controller = new AbortController();
    window.setTimeout(() => controller.abort(), 15000);

    fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: history, lang }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('llm-unavailable');
        const data = (await res.json()) as {
          text?: string;
          action?: { tab: TabType; borrowerMsmeId?: string; label?: string };
          map?: ChatMapPoint[];
          scoreMsmeId?: string;
        };
        if (!data.text) throw new Error('llm-empty');
        let action: AssistantAction | undefined;
        if (data.action) {
          const borrower = data.action.borrowerMsmeId
            ? ALL_BORROWERS.find((b) => b.msmeId === data.action!.borrowerMsmeId)
            : undefined;
          action = {
            label: data.action.label || `Open ${data.action.tab}`,
            tab: data.action.tab,
            borrower,
          };
        }
        const scoreMsmeId =
          data.scoreMsmeId && ALL_BORROWERS.some((b) => b.msmeId === data.scoreMsmeId)
            ? data.scoreMsmeId
            : undefined;
        addAssistantMessage({
          text: data.text,
          action,
          map: data.map && data.map.length >= 2 ? data.map : undefined,
          scoreMsmeId,
        });
        setThinking(false);
      })
      .catch(() => {
        const reply = generateReply(text);
        window.setTimeout(() => {
          addAssistantMessage({ text: reply.text, action: reply.action });
          setThinking(false);
        }, 400);
      });
  };

  const runAction = (action: AssistantAction) => {
    if (action.tab) onNavigate(action.tab);
    if (action.borrower && action.tab === 'borrowers') onSelectBorrower(action.borrower);
    setOpen(false);
  };

  return (
    <>
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-full bg-[#00685f] text-white shadow-lg shadow-[#00685f]/30 hover:bg-[#005a52] transition-colors"
          title="Climoid Risk Assistant"
        >
          <span className="material-symbols-outlined text-[22px]">smart_toy</span>
          <span className="text-[13px] font-semibold pr-1">Ask Climoid</span>
        </button>
      )}

      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-3rem)] h-[540px] max-h-[calc(100vh-3rem)] flex flex-col bg-white rounded-2xl border border-[#bcc9c6]/40 shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-[#00685f] text-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center">
                <span className="material-symbols-outlined text-[18px]">smart_toy</span>
              </div>
              <div>
                <div className="text-[14px] font-bold leading-none">Climoid Risk Assistant</div>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
                  <span className="text-[10px] font-mono text-white/80">Live • data-synced</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <select
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="h-7 rounded-lg bg-white/15 text-white text-[11px] px-1.5 outline-none border-none cursor-pointer hover:bg-white/25 transition-colors"
                title="Reply & speech-recognition language"
              >
                {LANGUAGES.map((l) => (
                  <option key={l.code} value={l.code} className="text-[#0b1c30]">
                    {l.label}
                  </option>
                ))}
              </select>
              {speaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center hover:bg-white/25 transition-colors"
                  title="Stop speaking"
                >
                  <span className="material-symbols-outlined text-[16px]">stop_circle</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  const next = !ttsEnabled;
                  setTtsEnabled(next);
                  if (!next) stopSpeaking();
                }}
                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${
                  ttsEnabled ? 'bg-white text-[#00685f]' : 'bg-white/15 text-white hover:bg-white/25'
                }`}
                title={ttsEnabled ? 'Voice replies on — click to mute' : 'Enable spoken replies (text-to-speech)'}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {ttsEnabled ? 'volume_up' : 'volume_off'}
                </span>
              </button>
              <button type="button" onClick={() => setOpen(false)} className="hover:opacity-80 transition-opacity">
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3.5 py-3 flex flex-col gap-2.5 bg-[#f8f9ff]">
            {messages.map((m) => (
              <div key={m.id} className={`flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`max-w-[85%] px-3.5 py-2.5 text-[12.5px] leading-relaxed rounded-2xl whitespace-pre-line ${
                    m.role === 'user'
                      ? 'bg-[#00685f] text-white rounded-br-md'
                      : 'bg-white text-[#0b1c30] border border-[#bcc9c6]/40 rounded-bl-md shadow-xs'
                  }`}
                >
                  {m.text}
                </div>

                {m.role === 'assistant' && m.map && m.map.length >= 2 && (
                  <div className="w-[330px] flex flex-col gap-2">
                    <ChatMiniMap points={m.map} />
                    <div className="flex flex-col gap-1.5">
                      {m.map.map((p, i) => (
                        <div
                          key={`${p.name}-${i}`}
                          className="flex items-start gap-2 bg-white border border-[#bcc9c6]/40 rounded-xl px-3 py-2"
                        >
                          <span
                            className="w-5 h-5 rounded-full text-white text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5"
                            style={{ background: PIN_COLORS[i % PIN_COLORS.length] }}
                          >
                            {i + 1}
                          </span>
                          <div className="text-[11.5px] leading-snug">
                            <span className="font-semibold text-[#0b1c30]">{p.name}</span>
                            <span className="text-[#3d4947]"> — {p.verdict}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {m.role === 'assistant' && m.scoreMsmeId && (() => {
                  const b = ALL_BORROWERS.find((x) => x.msmeId === m.scoreMsmeId);
                  return b ? <ScoreAnalysisCard b={b} /> : null;
                })()}

                {m.action && (
                  <button
                    type="button"
                    onClick={() => runAction(m.action!)}
                    className="flex items-center gap-1 text-[11px] font-semibold text-[#00685f] bg-white border border-[#00685f]/30 rounded-full px-3 py-1.5 hover:bg-[#e5eeff] transition-colors"
                  >
                    <span>{m.action.label}</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                )}
              </div>
            ))}

            {thinking && (
              <div className="flex items-start">
                <div className="px-3.5 py-3 bg-white border border-[#bcc9c6]/40 rounded-2xl rounded-bl-md flex gap-1">
                  {[0, 150, 300].map((d) => (
                    <span
                      key={d}
                      className="w-1.5 h-1.5 rounded-full bg-[#00685f]/60 animate-bounce"
                      style={{ animationDelay: `${d}ms` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Suggestions */}
          <div className="flex gap-1.5 px-3.5 pb-2 overflow-x-auto bg-[#f8f9ff]">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => send(s)}
                className="shrink-0 text-[11px] font-medium text-[#005049] bg-[#89f5e7]/40 border border-[#89f5e7]/60 rounded-full px-2.5 py-1 hover:bg-[#89f5e7]/60 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 px-3 py-2.5 border-t border-[#bcc9c6]/30 bg-white"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                recording ? 'Recording… tap the mic to stop' : transcribing ? 'Transcribing with Whisper…' : 'Ask about borrowers, alerts, risk…'
              }
              className="flex-1 text-[13px] bg-[#f2f4f6] rounded-xl px-3.5 py-2.5 outline-none focus:ring-2 focus:ring-[#00685f]/30 text-[#0b1c30] placeholder:text-[#6d7a77]"
            />
            <button
              type="button"
              onClick={toggleRecording}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                recording
                  ? 'bg-rose-600 text-white animate-pulse'
                  : 'bg-[#f2f4f6] text-[#00685f] border border-[#00685f]/30 hover:bg-[#e5eeff]'
              }`}
              title={recording ? 'Stop recording & transcribe (Whisper)' : 'Speak — record & transcribe with Whisper'}
            >
              <span className="material-symbols-outlined text-[18px]">{recording ? 'stop' : 'mic'}</span>
            </button>
            <button
              type="submit"
              disabled={!input.trim() || thinking || recording}
              className="w-9 h-9 rounded-xl bg-[#00685f] text-white flex items-center justify-center disabled:opacity-40 hover:bg-[#005a52] transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">send</span>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
