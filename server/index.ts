import 'dotenv/config';
import express from 'express';
import {
  PRIMARY_BORROWER,
  TOP_AT_RISK_BORROWERS,
  INITIAL_ALERTS,
  PORTFOLIO_MSME_EXPANDED,
} from '../src/data/mockData';
import { BorrowerRecord } from '../src/types';

const app = express();
const PORT = 3001;

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_BASE = 'https://api.groq.com/openai/v1';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_BASE = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

const CHAT_MODEL = process.env.GROQ_CHAT_MODEL || 'openai/gpt-oss-120b';
const CHAT_FALLBACK_MODEL = process.env.GROQ_CHAT_FALLBACK_MODEL || 'openai/gpt-oss-20b';
const WHISPER_MODEL_GROQ = process.env.GROQ_WHISPER_MODEL || 'whisper-large-v3';
const TTS_MODEL_GROQ = 'canopylabs/orpheus-v1-english';

const LANGUAGES: Record<string, string> = {
  en: 'English',
  hi: 'Hindi',
  mr: 'Marathi',
  te: 'Telugu',
  ta: 'Tamil',
  bn: 'Bengali',
};

const VALID_TABS = new Set([
  'dashboard',
  'map',
  'borrowers',
  'compare',
  'alerts',
  'scenarios',
  'portfolio',
  'reports',
  'settings',
]);

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ALL_BORROWERS: BorrowerRecord[] = [PRIMARY_BORROWER, ...TOP_AT_RISK_BORROWERS];

function compactBorrowers() {
  return ALL_BORROWERS.map((b) => ({
    msmeId: b.msmeId,
    name: b.name,
    sector: b.sector,
    location: b.location,
    district: b.district,
    state: b.state,
    coordinates: b.coordinates,
    facility: b.facilityAmountCr,
    facilityType: b.facilityType,
    tenorMonths: b.tenorMonths,
    baseScore: b.baseCreditScore,
    climateScore: b.climateAdjustedScore,
    dragPoints: b.climateDragPoints,
    dragPercent: b.climateDragPercent,
    riskBand: b.riskBand,
    riskCategory: b.riskCategory,
    basePdPercent: b.basePdPercent,
    adjustedPdPercent: b.adjustedPdPercent,
    revenueAtRiskCr: b.revenueAtRiskCr,
    revenueAtRiskPercent: b.revenueAtRiskPercent,
    turnoverCr: b.annualTurnoverCr,
    riverBufferM: b.riverBufferDistanceM,
    elevationMsl: b.elevationMsl,
    waterbody: b.waterbodyName,
    floodDepthM: b.floodDepthModeledM,
    supplyDowntimeDays: b.supplyRouteDowntimeDays,
    spreadAdjustmentBps: b.recommendedSpreadAdjustmentBps,
    covenants: b.recommendedCovenants,
  }));
}

function buildSystemPrompt(lang?: string): string {
  const languageInstruction =
    lang && lang !== 'en' && LANGUAGES[lang]
      ? `\n\n## Response language (mandatory)
The console is set to ${LANGUAGES[lang]}. Write your ENTIRE response in ${LANGUAGES[lang]}${
          ['hi', 'mr', 'bn'].includes(lang) ? ' (native Devanagari/Bengali script as appropriate)' : ''
        }${lang === 'te' ? ' (Telugu script)' : ''}${lang === 'ta' ? ' (Tamil script)' : ''} — including headings, reasoning and the final recommendation. Keep borrower IDs, MSME IDs, numerals, ₹/Cr/bps/% figures and model names unchanged.`
      : '';

  return `You are Climoid's Senior Climate Credit Advisor, embedded in a lending institution's MSME credit-risk console.

## Your mandate
The bank must lend to MSMEs that can repay reliably. Climoid adjusts each borrower's probability of default (PD) for climate exposure so credit decisions are defensible to the credit committee and regulators. For every question, ground your answer in the live console data below, cite concrete numbers (₹ crore, bps, PD %, score points, CRS bands), and always end with a clear, defensible recommendation in one of these forms:
- LEND / APPROVE — with justification
- LEND WITH CONDITIONS — specify spread adjustment (bps) and covenants
- HOLD / REVIEW — what evidence is pending
- RESTRUCTURE / ESCALATE — for high climate risk
If asked "who should we lend to", rank borrowers by repayment reliability after climate adjustment and justify with base vs adjusted PD, climate drag, revenue-at-risk and mitigation capacity.

## Scoring methodology (authoritative)
- Climate-adjusted PD: PD_c = Φ(Φ⁻¹(PD_0) + λ·CLR). CLR (Climate Loss Ratio) = expected fraction of annual revenue lost to climate hazards annually. λ (transmission) rises with operating leverage — thin-margin borrowers are hit harder.
- Hazards: flood (Gumbel/EV-I on river discharge, 10-yr return trigger, susceptibility from HAND height-above-drainage, elevation, historical surface water, WB flood-exposure grid), heat (apparent T > local 95th percentile ≥2 consecutive days), drought (SPI ≤ −1 on gamma-fitted precipitation), storm (gusts > ~60 km/h).
- Vulnerability: sector baseline × asset attributes (ground-floor premises, outdoor ops, perishable inventory, power/water dependence). Downtime grows with event intensity and grid fragility; backup power shortens it. Resilience = noisy-OR over insurance, cash buffer (months of fixed costs), inventory/diversification.
- Score: S = 600 + (40/ln2)·ln(((1−PD)/PD)/50). The drop from base to adjusted score is the "climate penalty" shown on every card.
- CRS (Climate Resilience Score, 0–100, higher = safer) = 100·exp(−CLR/0.05). Bands: A ≥80 Low, B 65–80 Moderate, C 50–65 Elevated (price/condition), D 35–50 High (insurance/restructuring conditions), E <35 Severe (escalate).
- LGD_c = min(1, LGD_0 + ψ·Σ P_h·A_h) — collateral damage raises LGD. ΔEL = EL_c − EL_0 drives risk-based pricing: Δr ≈ (ΔEL/EAD)×10⁴ bps.
- Scenarios: CCKP CMIP6 delta-change — SSP2-4.5 / SSP5-8.5 × 2030/2040/2050; heat shifts by ΔT, flood Gumbel scales ~7%/K (Clausius–Clapeyron), precipitation rescales SPI.
- Portfolio: Gaussian copula with district-level spatial correlation, Monte-Carlo VaR99/ES; climate add-on = ΔVaR99; HHI measures district concentration.
- Alerts: raised when max hazard probability over 72h ≥ threshold or exposure-weighted PD jump is large; ranked by priority = EAD·LGD·ΔPD; actions include moratorium, RM calls, working-capital lines.
- Validation: AUC/KS ranking, Brier/reliability calibration, event studies (Chennai 2015, Kerala 2018, Kolhapur–Sangli 2019, Assam floods) — the model's PD rise must precede events.

## Live borrower files (all tracked MSMEs)
${JSON.stringify(compactBorrowers())}

## Live climate alerts board
${JSON.stringify(INITIAL_ALERTS)}

## Portfolio concentration table
${JSON.stringify(PORTFOLIO_MSME_EXPANDED)}

## Directives (response enrichment — each on its own line at the very END of your reply)
1. Score analysis — when your reply analyses the creditworthiness / credibility score of a SPECIFIC tracked borrower, ALWAYS append:
[[SCORE: <exact msmeId from the data>]]
2. Map comparison — when comparing regions, states or markets geographically, ALWAYS append:
[[MAP: [{"lat": 26.8, "lng": 80.9, "name": "Uttar Pradesh — Gangetic plain", "verdict": "one-line climate-credit verdict"}, {"lat": 16.5, "lng": 80.6, "name": "Andhra Pradesh — Krishna-Godavari delta", "verdict": "..."}]]
Provide 2–4 points with representative coordinates and an exact JSON array.
3. Console navigation — optionally append a shortcut:
[[NAV: <tab> | optional-msmeId | optional-button-label]]
Valid tabs: dashboard, map, borrowers, compare, alerts, scenarios, portfolio, reports, settings. Use msmeId only for the borrowers tab.
You may combine SCORE + NAV for a borrower answer. Never use these markers anywhere except these final directive lines.

## Beyond the live data — geographic & sector advisory (IMPORTANT)
When asked about markets, sectors or states NOT yet tracked in the console (e.g. "Should we lend into the rice market in UP or Andhra Pradesh?"):
1. NEVER refuse or say you have no data. Give a climate-credit advisory using your general knowledge of Indian climate geography, framed through the Climoid methodology above.
2. Compare: hazard profile (fluvial flood exposure, cyclone corridor, heatwave days, drought/monsoon variability), sector vulnerability (paddy processing: water dependence, perishability, single-crop concentration, cold-chain needs), infrastructure (grid reliability, irrigation coverage, logistics/ports), and resilience patterns (insurance penetration, MSP-linked cash flows).
3. End with a clear conditional recommendation — where to lend, at what pricing/covenants — and note that once specific MSMEs from that region are onboarded, Climoid will produce their climate-adjusted PD, CRS and pricing.

Geography briefing (extend with your own knowledge):
- Uttar Pradesh (Gangetic plain): high fluvial flood exposure (Ganga/Yamuna/Ramganga basins), rising severe-heatwave trend, dense but outage-prone rural grid, large paddy/wheat belts with MSP-driven turnover; drainage and flood depth are the critical checks.
- Andhra Pradesh (Krishna–Godavari delta): Bay of Bengal cyclone corridor with wind + coastal surge, delta flooding, Rayalaseema drought pockets, but excellent delta irrigation (high, stable paddy yields) and strong port logistics; cyclone downtime is the dominant peril.
- Bihar/Assam (Brahmaputra): extreme recurrent flood, siltation; highest climate drag per unit exposure.
- Tamil Nadu (Cauvery delta): drought/monsoon-failure + surge exposure for coastal districts.
- Coastal Odisha: cyclone corridor with hardened infrastructure post-1999; moderate resilience.

## Style
- Concise, committee-ready answers (under ~180 words unless asked for detail). Bullet points welcome.
- Only use the data above — never invent borrowers, figures or alerts.
- Currency in ₹ crore (Cr). Rates in bps. PD in %.
- You speak for the lending institution, not the borrower.${languageInstruction}`;
}

app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    ok: true,
    llm: Boolean(GROQ_API_KEY || OPENAI_API_KEY),
    whisper: Boolean(GROQ_API_KEY || OPENAI_API_KEY),
  });
});

interface MapPoint {
  lat: number;
  lng: number;
  name: string;
  verdict: string;
}

function parseDirectives(raw: string): {
  text: string;
  action?: { tab: string; msmeId?: string; label?: string };
  map?: MapPoint[];
  scoreMsmeId?: string;
} {
  let text = raw;

  let map: MapPoint[] | undefined;
  const mapMatch = text.match(/\[\[MAP:\s*(\[[\s\S]*?\])\s*\]\]/);
  if (mapMatch) {
    try {
      const parsed = JSON.parse(mapMatch[1]) as MapPoint[];
      map = parsed
        .filter((p) => p && typeof p.lat === 'number' && typeof p.lng === 'number' && p.name)
        .slice(0, 4)
        .map((p) => ({
          lat: Math.max(-85, Math.min(85, p.lat)),
          lng: Math.max(-180, Math.min(180, p.lng)),
          name: String(p.name).slice(0, 60),
          verdict: String(p.verdict || '').slice(0, 200),
        }));
      if (map.length < 2) map = undefined;
    } catch {
      map = undefined;
    }
    text = text.replace(mapMatch[0], '');
  }

  let scoreMsmeId: string | undefined;
  const scoreMatch = text.match(/\[\[SCORE:\s*([A-Za-z0-9-]+)\s*\]\]/);
  if (scoreMatch) {
    scoreMsmeId = scoreMatch[1].toUpperCase();
    text = text.replace(scoreMatch[0], '');
  }

  let action: { tab: string; msmeId?: string; label?: string } | undefined;
  const navMatch = text.match(/\[\[NAV:\s*([a-z]+)\s*(?:\|\s*([A-Za-z0-9-]+)\s*)?(?:\|\s*([^\]]*?)\s*)?\]\]/i);
  if (navMatch) {
    text = text.replace(navMatch[0], '');
    const tab = navMatch[1]?.toLowerCase();
    if (tab && VALID_TABS.has(tab)) {
      action = { tab, msmeId: navMatch[2], label: navMatch[3] || undefined };
    }
  }

  return { text: text.trim(), action, map, scoreMsmeId };
}

app.post('/api/chat', async (req, res) => {
  const body = (req.body as { messages?: ChatMessage[]; lang?: string } | undefined) || {};
  const history = body.messages;
  const lang = body.lang && LANGUAGES[body.lang] ? body.lang : 'en';
  if (!Array.isArray(history) || history.length === 0) {
    return res.status(400).json({ error: 'Field "messages" is required.' });
  }
  const candidates: { base: string; key: string; model: string }[] = [];
  if (GROQ_API_KEY) {
    for (const m of [CHAT_MODEL, CHAT_FALLBACK_MODEL]) {
      if (!candidates.some((c) => c.model === m)) {
        candidates.push({ base: GROQ_BASE, key: GROQ_API_KEY, model: m });
      }
    }
  } else if (OPENAI_API_KEY) {
    candidates.push({ base: OPENAI_BASE, key: OPENAI_API_KEY, model: process.env.OPENAI_CHAT_MODEL || 'gpt-4o-mini' });
  }
  if (candidates.length === 0) {
    return res.status(501).json({ error: 'No LLM key configured (set GROQ_API_KEY in .env).' });
  }

  let lastError = 'LLM request failed.';
  for (const provider of candidates) {
    const payload: Record<string, unknown> = {
      model: provider.model,
      temperature: 0.3,
      max_tokens: 1024,
      messages: [{ role: 'system', content: buildSystemPrompt(lang) }, ...history.slice(-16)],
    };
    if (provider.model.includes('gpt-oss')) payload.reasoning_effort = 'low';
    try {
      const r = await fetch(`${provider.base}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${provider.key}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await r.json().catch(() => ({}))) as {
        choices?: { message?: { content?: string } }[];
        error?: { message?: string };
      };
      if (!r.ok) {
        lastError = `${provider.model}: ${data.error?.message || 'request failed'}`;
        continue;
      }
      const raw = data.choices?.[0]?.message?.content || '';
      if (!raw.trim()) {
        lastError = `${provider.model}: empty response`;
        continue;
      }
      const parsed = parseDirectives(raw);
      const msmeId = parsed.action?.msmeId?.toUpperCase();
      const borrower = msmeId ? ALL_BORROWERS.find((b) => b.msmeId.toUpperCase() === msmeId) : undefined;
      const scoreBorrower = parsed.scoreMsmeId
        ? ALL_BORROWERS.find((b) => b.msmeId.toUpperCase() === parsed.scoreMsmeId)
        : undefined;
      return res.json({
        text: parsed.text,
        action: parsed.action
          ? {
              tab: parsed.action.tab,
              borrowerMsmeId: borrower?.msmeId,
              label: parsed.action.label,
            }
          : undefined,
        map: parsed.map,
        scoreMsmeId: scoreBorrower?.msmeId,
      });
    } catch (e) {
      lastError = `${provider.model}: ${e instanceof Error ? e.message : 'request failed'}`;
      continue;
    }
  }
  return res.status(502).json({ error: `All LLM models failed. Last error: ${lastError}` });
});

app.post(
  '/api/transcribe',
  express.raw({ type: '*/*', limit: '25mb' }),
  async (req, res) => {
    const provider = GROQ_API_KEY
      ? { base: GROQ_BASE, key: GROQ_API_KEY, model: WHISPER_MODEL_GROQ }
      : OPENAI_API_KEY
        ? { base: OPENAI_BASE, key: OPENAI_API_KEY, model: 'whisper-1' }
        : null;
    if (!provider) {
      return res.status(500).json({ error: 'No speech key configured (set GROQ_API_KEY in .env).' });
    }
    const audio = req.body as unknown as Uint8Array | undefined;
    if (!audio || audio.length === 0) {
      return res.status(400).json({ error: 'No audio received.' });
    }
    try {
      const mime = req.headers['content-type'] || 'audio/webm';
      const ext = mime.includes('ogg') ? 'ogg' : mime.includes('mp4') ? 'mp4' : 'webm';
      const fd = new FormData();
      fd.append('file', new Blob([audio.slice().buffer as ArrayBuffer], { type: mime }), `speech.${ext}`);
      fd.append('model', provider.model);
      fd.append('temperature', '0');
      const lang = req.headers['x-language'];
      if (typeof lang === 'string' && LANGUAGES[lang]) fd.append('language', lang);

      const r = await fetch(`${provider.base}/audio/transcriptions`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${provider.key}` },
        body: fd,
      });
      const data = (await r.json()) as { text?: string; error?: { message?: string } };
      if (!r.ok) {
        return res.status(r.status).json({ error: data.error?.message || 'Whisper transcription failed.' });
      }
      return res.json({ text: data.text || '' });
    } catch (e) {
      return res.status(500).json({ error: e instanceof Error ? e.message : 'Transcription failed.' });
    }
  }
);

app.post('/api/tts', async (req, res) => {
  const text = (req.body as { text?: string } | undefined)?.text;
  if (!text) {
    return res.status(400).json({ error: 'Field "text" is required.' });
  }
  const ttsProviders: { base: string; key: string; model: string }[] = [];
  if (GROQ_API_KEY) ttsProviders.push({ base: GROQ_BASE, key: GROQ_API_KEY, model: TTS_MODEL_GROQ });
  if (OPENAI_API_KEY) ttsProviders.push({ base: OPENAI_BASE, key: OPENAI_API_KEY, model: 'tts-1' });

  for (const p of ttsProviders) {
    try {
      const r = await fetch(`${p.base}/audio/speech`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${p.key}`,
        },
        body: JSON.stringify({
          model: p.model,
          voice: 'tessa',
          input: text.slice(0, 4096),
        }),
      });
      if (!r.ok) continue;
      res.set('Content-Type', r.headers.get('content-type') || 'audio/mpeg');
      return res.send(new Uint8Array(await r.arrayBuffer()));
    } catch {
      continue;
    }
  }
  return res.status(501).json({ error: 'No TTS provider succeeded — client should fall back to browser speech synthesis.' });
});

app.listen(PORT, () => {
  console.log(`Climoid voice + advisor backend listening on http://localhost:${PORT}`);
  console.log(`LLM: ${GROQ_API_KEY ? `Groq (${CHAT_MODEL})` : OPENAI_API_KEY ? 'OpenAI' : 'MISSING'}`);
  console.log(`Whisper: ${GROQ_API_KEY ? 'Groq whisper-large-v3' : OPENAI_API_KEY ? 'OpenAI whisper-1' : 'MISSING'}`);
  console.log(`TTS: ${OPENAI_API_KEY ? 'OpenAI tts-1' : 'browser fallback'}`);
});
