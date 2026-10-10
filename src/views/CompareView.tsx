import React, { useCallback, useMemo, useRef, useState, useEffect } from 'react';
import { BorrowerRecord, RiskGrade } from '../types';
import { PRIMARY_BORROWER, TOP_AT_RISK_BORROWERS } from '../data/mockData';
import { loadGoogleMaps, bandPinSymbol } from '../lib/googleMaps';

const ALL: BorrowerRecord[] = [PRIMARY_BORROWER, ...TOP_AT_RISK_BORROWERS];

const BAND_COLORS: Record<RiskGrade, string> = {
  A: '#10b981',
  B: '#84cc16',
  C: '#eab308',
  D: '#f97316',
  E: '#e11d48',
};

interface Ranges {
  flood: [number, number];
  buffer: [number, number];
  downtime: [number, number];
  revRisk: [number, number];
  baseScore: [number, number];
  turnover: [number, number];
  elevation: [number, number];
  mitigation: [number, number];
}

function norm(v: number, [min, max]: [number, number]): number {
  if (max === min) return 0.5;
  return Math.max(0, Math.min(1, (v - min) / (max - min)));
}

function sectorVulnerability(sector: string): number {
  const s = sector.toLowerCase();
  if (/(cold|food|fisher|feed|packhouse)/.test(s)) return 0.55;
  if (/(chemical|solvent|fertil|biofuel|bio-energy)/.test(s)) return 0.5;
  if (/(agri|warehouse|logistic|silo)/.test(s)) return 0.52;
  if (/(textile|weav|filament|paper|packaging)/.test(s)) return 0.48;
  if (/(auto|metallurg|cast|foundr|forge)/.test(s)) return 0.4;
  return 0.45;
}

function hazardIndex(b: BorrowerRecord, r: Ranges): number {
  const flood = norm(b.floodDepthModeledM, r.flood);
  const proximity = 1 - norm(b.riverBufferDistanceM, r.buffer);
  const lowElevation = 1 - norm(b.elevationMsl, r.elevation);
  return Math.round((flood * 0.45 + proximity * 0.35 + lowElevation * 0.2) * 100);
}

function vulnerabilityIndex(b: BorrowerRecord, r: Ranges): number {
  const sector = sectorVulnerability(b.sector);
  const downtime = norm(b.supplyRouteDowntimeDays, r.downtime);
  const revRisk = norm(b.revenueAtRiskPercent, r.revRisk);
  return Math.round((sector * 0.45 + downtime * 0.35 + revRisk * 0.2) * 100);
}

function resilienceIndex(b: BorrowerRecord, r: Ranges): number {
  const mitigation = norm(b.mitigationScoreDelta, r.mitigation);
  const base = norm(b.baseCreditScore, r.baseScore);
  const scale = norm(b.annualTurnoverCr, r.turnover);
  return Math.round((mitigation * 0.5 + base * 0.3 + scale * 0.2) * 100);
}

function levelLabel(v: number, invert = false): string {
  const x = invert ? 100 - v : v;
  if (x < 35) return 'low';
  if (x < 60) return 'moderate';
  if (x < 80) return 'high';
  return 'severe';
}

function climateIndex(b: BorrowerRecord, r: Ranges): number {
  const flood = norm(b.floodDepthModeledM, r.flood);
  const bufferRisk = 1 - norm(b.riverBufferDistanceM, r.buffer);
  const downtime = norm(b.supplyRouteDowntimeDays, r.downtime);
  const revRisk = norm(b.revenueAtRiskPercent, r.revRisk);
  return Math.round((flood * 0.35 + bufferRisk * 0.25 + downtime * 0.2 + revRisk * 0.2) * 100);
}

function strengthIndex(b: BorrowerRecord, r: Ranges): number {
  const base = norm(b.baseCreditScore, r.baseScore);
  const scale = norm(b.annualTurnoverCr, r.turnover);
  return Math.round((base * 0.7 + scale * 0.3) * 100);
}

function sectorBlurb(sector: string): string {
  const s = sector.toLowerCase();
  if (/(cold|food|fisher|feed|packhouse)/.test(s)) {
    return 'Perishable inventory and continuous cold-chain power dependence make outage hours and flood ingress the dominant loss drivers.';
  }
  if (/(auto|metallurg|cast|foundr|forge)/.test(s)) {
    return 'Precision tooling and tight machining tolerances mean even shallow flooding forces long recalibration and restart downtime.';
  }
  if (/(chemical|solvent|fertil|biofuel|bio-energy)/.test(s)) {
    return 'Hazardous-material handling amplifies storm and flood losses; drainage, containment and effluent integrity are critical.';
  }
  if (/(textile|weav|filament|paper|packaging)/.test(s)) {
    return 'Process-water dependence and wet-stock damage drive high single-event loss ratios, especially in dyeing and finishing stages.';
  }
  if (/(agri|warehouse|logistic|silo)/.test(s)) {
    return 'Single-corridor route dependence and moisture spoilage drive supply-chain downtime losses more than asset damage.';
  }
  return 'Sector-standard vulnerability profile applied with site-specific terrain and grid adjustments.';
}

function formatCr(v: number): string {
  return v >= 100 ? v.toFixed(0) : v.toFixed(2).replace(/0$/, '');
}

interface MetricRow {
  label: string;
  render: (b: BorrowerRecord) => string;
  num?: (b: BorrowerRecord) => number;
  better?: 'high' | 'low';
}

const METRIC_GROUPS: { title: string; icon: string; rows: MetricRow[] }[] = [
  {
    title: 'Company Profile',
    icon: 'factory',
    rows: [
      { label: 'Sector', render: (b) => b.sector },
      { label: 'District / State', render: (b) => `${b.district}, ${b.state}` },
      {
        label: 'Facility',
        render: (b) => `₹${formatCr(b.facilityAmountCr)} Cr · ${b.facilityType}`,
      },
      { label: 'Tenor', render: (b) => `${b.tenorMonths} months` },
      { label: 'Annual Turnover', render: (b) => `₹${formatCr(b.annualTurnoverCr)} Cr`, num: (b) => b.annualTurnoverCr, better: 'high' },
    ],
  },
  {
    title: 'Credit & Climate Scores',
    icon: 'speed',
    rows: [
      { label: 'Base Credit Score', render: (b) => String(b.baseCreditScore), num: (b) => b.baseCreditScore, better: 'high' },
      {
        label: 'Climate-Adjusted Score',
        render: (b) => String(b.climateAdjustedScore),
        num: (b) => b.climateAdjustedScore,
        better: 'high',
      },
      {
        label: 'Climate Drag (points)',
        render: (b) => `−${b.climateDragPoints} pts`,
        num: (b) => b.climateDragPoints,
        better: 'low',
      },
      {
        label: 'Climate Drag (%)',
        render: (b) => `−${b.climateDragPercent}%`,
        num: (b) => b.climateDragPercent,
        better: 'low',
      },
      { label: 'PD — Base', render: (b) => `${b.basePdPercent}%`, num: (b) => b.basePdPercent, better: 'low' },
      {
        label: 'PD — Climate-Adjusted',
        render: (b) => `${b.adjustedPdPercent}%`,
        num: (b) => b.adjustedPdPercent,
        better: 'low',
      },
      { label: 'Revenue at Risk', render: (b) => `₹${formatCr(b.revenueAtRiskCr)} Cr (${b.revenueAtRiskPercent}%)`, num: (b) => b.revenueAtRiskPercent, better: 'low' },
    ],
  },
  {
    title: 'Climate Exposure',
    icon: 'flood',
    rows: [
      { label: 'Modelled Flood Depth', render: (b) => `${b.floodDepthModeledM} m`, num: (b) => b.floodDepthModeledM, better: 'low' },
      {
        label: 'River Buffer Distance',
        render: (b) => `${b.riverBufferDistanceM} m`,
        num: (b) => b.riverBufferDistanceM,
        better: 'high',
      },
      { label: 'Waterbody / Basin', render: (b) => b.waterbodyName },
      {
        label: 'Supply-Route Downtime',
        render: (b) => `${b.supplyRouteDowntimeDays} days`,
        num: (b) => b.supplyRouteDowntimeDays,
        better: 'low',
      },
      { label: 'Elevation (MSL)', render: (b) => `${b.elevationMsl} m` },
    ],
  },
  {
    title: 'Pricing & Covenants',
    icon: 'payments',
    rows: [
      {
        label: 'Recommended Spread',
        render: (b) => `+${b.recommendedSpreadAdjustmentBps} bps`,
        num: (b) => b.recommendedSpreadAdjustmentBps,
        better: 'low',
      },
      {
        label: 'Climate Covenants',
        render: (b) =>
          b.recommendedCovenants.length > 0
            ? b.recommendedCovenants.map((c) => (c.length > 72 ? `${c.slice(0, 72)}…` : c)).join(' · ')
            : 'None',
        num: (b) => b.recommendedCovenants.length,
        better: 'low',
      },
    ],
  },
];

function borrowerInfoHtml(b: BorrowerRecord, inComparison: boolean): string {
  return `<div style="font-size:12px;line-height:1.55;max-width:240px">
    <b style="font-size:12.5px">${b.name}</b><br/>
    <span style="color:#565e74">${b.sector} • ${b.district}, ${b.state}</span><br/>
    Base score ${b.baseCreditScore} → <b style="color:${BAND_COLORS[b.riskBand]}">${b.climateAdjustedScore}</b>
    (−${b.climateDragPoints} pts)<br/>
    PD ${b.basePdPercent}% → <b>${b.adjustedPdPercent}%</b> • Band <b style="color:${BAND_COLORS[b.riskBand]}">${b.riskBand}</b><br/>
    <span style="color:#e11d48">₹${formatCr(b.revenueAtRiskCr)} Cr revenue at risk (${b.revenueAtRiskPercent}%)</span><br/>
    <span style="color:${inComparison ? '#e11d48' : '#00685f'};font-weight:600">
      ${inComparison ? 'Tap to remove from comparison' : 'Tap to add to comparison'}
    </span>
  </div>`;
}

function CompareIndiaMap({
  selectedIds,
  onToggle,
}: {
  selectedIds: string[];
  onToggle: (id: string) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const infoRef = useRef<google.maps.InfoWindow | null>(null);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      const map = new google.maps.Map(containerRef.current, {
        center: { lat: 20.5, lng: 78.9 },
        zoom: 5,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: false,
      });
      infoRef.current = new google.maps.InfoWindow();
      const bounds = new google.maps.LatLngBounds();
      ALL.forEach((b) => {
        const marker = new google.maps.Marker({
          position: { lat: b.coordinates.lat, lng: b.coordinates.lng },
          map,
          icon: bandPinSymbol(BAND_COLORS[b.riskBand], selectedIds.includes(b.id)),
          label: {
            text: b.riskBand,
            color: '#ffffff',
            fontSize: '11px',
            fontWeight: '700',
          },
          title: `${b.name} — score ${b.climateAdjustedScore}`,
        });
        marker.addListener('click', () => {
          onToggle(b.id);
          const info = infoRef.current;
          if (info) {
            info.setContent(borrowerInfoHtml(b, !selectedIds.includes(b.id)));
            info.open({ map, anchor: marker });
          }
        });
        markersRef.current.set(b.id, marker);
        bounds.extend(marker.getPosition()!);
      });
      map.fitBounds(bounds, 48);
      setReady(true);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!ready) return;
    markersRef.current.forEach((marker, id) => {
      const b = ALL.find((x) => x.id === id);
      if (b) marker.setIcon(bandPinSymbol(BAND_COLORS[b.riskBand], selectedIds.includes(id)));
    });
  }, [ready, selectedIds]);

  return (
    <div
      ref={containerRef}
      className="h-[420px] w-full rounded-2xl border border-[#bcc9c6]/40 bg-[#eef3f1]"
    />
  );
}

export function CompareView({ onOpenBorrower }: { onOpenBorrower: (b: BorrowerRecord) => void }) {
  const [selectedIds, setSelectedIds] = useState<string[]>([ALL[0].id, ALL[1].id, ALL[2].id]);
  const [query, setQuery] = useState('');

  const toggle = useCallback((id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);

  const selected = useMemo(
    () => ALL.filter((b) => selectedIds.includes(b.id)),
    [selectedIds]
  );
  const sorted = useMemo(
    () => [...selected].sort((a, b) => b.climateAdjustedScore - a.climateAdjustedScore),
    [selected]
  );
  const winner = sorted[0];
  const worst = sorted.length > 1 ? sorted[sorted.length - 1] : undefined;

  const ranges: Ranges = useMemo(() => {
    const col = (fn: (b: BorrowerRecord) => number): [number, number] => [
      Math.min(...ALL.map(fn)),
      Math.max(...ALL.map(fn)),
    ];
    return {
      flood: col((b) => b.floodDepthModeledM),
      buffer: col((b) => b.riverBufferDistanceM),
      downtime: col((b) => b.supplyRouteDowntimeDays),
      revRisk: col((b) => b.revenueAtRiskPercent),
      baseScore: col((b) => b.baseCreditScore),
      turnover: col((b) => b.annualTurnoverCr),
      elevation: col((b) => b.elevationMsl),
      mitigation: col((b) => b.mitigationScoreDelta),
    };
  }, []);

  const idx = useMemo(() => {
    const m = new Map<
      string,
      { climate: number; strength: number; hazard: number; vuln: number; res: number }
    >();
    ALL.forEach((b) => {
      m.set(b.id, {
        climate: climateIndex(b, ranges),
        strength: strengthIndex(b, ranges),
        hazard: hazardIndex(b, ranges),
        vuln: vulnerabilityIndex(b, ranges),
        res: resilienceIndex(b, ranges),
      });
    });
    return m;
  }, [ranges]);

  const filteredList = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return ALL;
    return ALL.filter(
      (b) =>
        b.name.toLowerCase().includes(q) ||
        b.msmeId.toLowerCase().includes(q) ||
        b.sector.toLowerCase().includes(q) ||
        b.district.toLowerCase().includes(q)
    );
  }, [query]);

  const allGroups = useMemo(() => {
    const val = (b: BorrowerRecord, k: 'hazard' | 'vuln' | 'res') => idx.get(b.id)![k];
    return [
      ...METRIC_GROUPS,
      {
        title: 'Three-Factor Climate Engine (0–100)',
        icon: 'tune',
        rows: [
          {
            label: 'Hazard Index — P(disrupting event)',
            render: (b: BorrowerRecord) => `${val(b, 'hazard')}/100 — ${levelLabel(val(b, 'hazard'))}`,
            num: (b: BorrowerRecord) => val(b, 'hazard'),
            better: 'low' as const,
          },
          {
            label: 'Vulnerability Index — revenue lost per event',
            render: (b: BorrowerRecord) => `${val(b, 'vuln')}/100 — ${levelLabel(val(b, 'vuln'))}`,
            num: (b: BorrowerRecord) => val(b, 'vuln'),
            better: 'low' as const,
          },
          {
            label: 'Resilience Index — loss absorbed by buffers',
            render: (b: BorrowerRecord) => `${val(b, 'res')}/100`,
            num: (b: BorrowerRecord) => val(b, 'res'),
            better: 'high' as const,
          },
        ],
      },
    ];
  }, [idx]);

  const bestWorst = (row: MetricRow): { bestId?: string; worstId?: string } => {
    if (!row.num || !row.better || selected.length < 2) return {};
    const values = selected.map((b) => ({ id: b.id, v: row.num!(b) }));
    const uniq = new Set(values.map((x) => x.v));
    if (uniq.size < 2) return {};
    values.sort((a, b) => (row.better === 'high' ? b.v - a.v : a.v - b.v));
    return { bestId: values[0].id, worstId: values[values.length - 1].id };
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-end justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">MSME Climate-Score Comparison Workbench</h1>
          <p className="text-[12.5px] text-[#565e74] mt-0.5">
            Compare as many MSMEs as you like — spec-by-spec, best/worst highlighted — and see which company carries the
            lowest climate-adjusted risk before you lend.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#565e74] bg-white border border-[#bcc9c6]/40 px-2 py-1 rounded">
            {selected.length} / {ALL.length} selected
          </span>
          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-[12px] font-medium text-[#e11d48] bg-white border border-rose-200 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
          >
            Clear all
          </button>
        </div>
      </div>

      {/* ============ INDIA MAP ============ */}
      <section className="bg-white border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xs">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          <span className="material-symbols-outlined text-[18px] text-[#00685f]">location_on</span>
          <h2 className="text-[14px] font-bold text-[#0b1c30]">Where our MSMEs sit — India map</h2>
          <span className="font-mono text-[10px] text-[#00685f] bg-[#89f5e7]/40 px-1.5 py-0.5 rounded font-semibold">
            {ALL.length} BORROWERS
          </span>
          <span className="ml-auto font-mono text-[10.5px] text-[#565e74]">
            filled pin = in comparison · faded pin = not selected · tap a pin to add/remove
          </span>
        </div>
        <CompareIndiaMap selectedIds={selectedIds} onToggle={toggle} />
        <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-2.5">
          {(['A', 'B', 'C', 'D', 'E'] as RiskGrade[]).map((g) => (
            <span key={g} className="flex items-center gap-1 font-mono text-[10px] text-[#565e74]">
              <span className="w-2.5 h-2.5 rounded-full" style={{ background: BAND_COLORS[g] }} />
              Band {g}
            </span>
          ))}
        </div>
      </section>

      <div className="grid grid-cols-[280px_1fr] gap-4 items-start">
        {/* ============ PICKER ============ */}
        <aside className="bg-white border border-[#bcc9c6]/40 rounded-2xl shadow-xs flex flex-col max-h-[560px]">
          <div className="p-3 border-b border-[#bcc9c6]/30 bg-[#f8f9ff] rounded-t-2xl">
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-white border border-[#bcc9c6]/50 rounded-lg">
              <span className="material-symbols-outlined text-[17px] text-[#565e74]">search</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, sector, district…"
                className="flex-1 text-[12.5px] outline-none text-[#0b1c30] placeholder:text-[#6d7a77]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scroll p-2 flex flex-col gap-1">
            {filteredList.map((b) => {
              const isSel = selectedIds.includes(b.id);
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => toggle(b.id)}
                  className={`text-left px-2.5 py-2 rounded-xl border transition-all ${
                    isSel
                      ? 'bg-[#e5eeff] border-[#00685f]/40'
                      : 'bg-white border-transparent hover:bg-[#f2f4f6] border-[#bcc9c6]/20'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[12px] font-semibold text-[#0b1c30] leading-tight">{b.name}</span>
                    <span
                      className="shrink-0 font-mono text-[10px] font-bold text-white w-5 h-5 rounded flex items-center justify-center"
                      style={{ background: BAND_COLORS[b.riskBand] }}
                    >
                      {b.riskBand}
                    </span>
                  </div>
                  <div className="font-mono text-[10px] text-[#6d7a77] mt-1">
                    {b.sector} • {b.district} • score {b.climateAdjustedScore}
                  </div>
                </button>
              );
            })}
            {filteredList.length === 0 && (
              <div className="text-[12px] text-[#6d7a77] text-center py-6">No MSMEs match "{query}"</div>
            )}
          </div>
          <div className="p-2.5 border-t border-[#bcc9c6]/30 bg-[#f8f9ff] rounded-b-2xl font-mono text-[10.5px] text-[#565e74] text-center">
            Tap any MSME to add / remove it from the comparison
          </div>
        </aside>

        <div className="flex flex-col gap-4 min-w-0">
          {/* ============ VERDICT BANNER ============ */}
          {selected.length >= 2 && winner && worst && (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white border border-emerald-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-emerald-700">verified</span>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                    Safest to lend — lowest climate risk
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0b1c30] truncate">{winner.name}</div>
                  <div className="font-mono text-[10.5px] text-[#565e74]">
                    score {winner.climateAdjustedScore} · PD {winner.adjustedPdPercent}% · drag −{winner.climateDragPoints} pts ·{' '}
                    +{winner.recommendedSpreadAdjustmentBps} bps
                  </div>
                </div>
              </div>
              <div className="bg-white border border-rose-200 rounded-2xl p-3.5 flex items-center gap-3 shadow-xs">
                <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[22px] text-rose-700">warning</span>
                </div>
                <div className="min-w-0">
                  <div className="font-mono text-[10px] font-bold text-rose-700 uppercase tracking-wider">
                    Highest climate risk in this set
                  </div>
                  <div className="text-[13.5px] font-bold text-[#0b1c30] truncate">{worst.name}</div>
                  <div className="font-mono text-[10.5px] text-[#565e74]">
                    score {worst.climateAdjustedScore} · PD {worst.adjustedPdPercent}% · drag −{worst.climateDragPoints} pts ·{' '}
                    +{worst.recommendedSpreadAdjustmentBps} bps
                  </div>
                </div>
              </div>
            </div>
          )}

          {selected.length === 0 ? (
            <div className="bg-white border border-dashed border-[#bcc9c6] rounded-2xl p-10 text-center">
              <span className="material-symbols-outlined text-[36px] text-[#bcc9c6]">compare_arrows</span>
              <div className="text-[14px] font-semibold text-[#0b1c30] mt-2">Pick MSMEs to start comparing</div>
              <div className="text-[12px] text-[#6d7a77] mt-1">
                Select two or more companies from the panel on the left.
              </div>
            </div>
          ) : (
            <>
              {/* ============ SCORE BARS ============ */}
              <section className="bg-white border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-3">
                  <span className="material-symbols-outlined text-[18px] text-[#00685f]">leaderboard</span>
                  <h2 className="text-[14px] font-bold text-[#0b1c30]">Climate-Adjusted Score Comparison (300–900)</h2>
                  <div className="ml-auto flex items-center gap-3 font-mono text-[10px] text-[#565e74]">
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded-sm bg-[#00685f]/30" /> base score
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-3 h-2 rounded-sm" style={{ background: '#f97316' }} /> climate-adjusted
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  {sorted.map((b) => (
                    <div key={b.id} className="flex items-center gap-2.5">
                      <span className="w-40 text-[11.5px] font-medium text-[#0b1c30] truncate" title={b.name}>
                        {b.name}
                      </span>
                      <div className="flex-1 h-5 bg-[#f2f4f6] rounded-md overflow-hidden relative">
                        <div
                          className="absolute inset-y-0 left-0 rounded-md bg-[#00685f]/25"
                          style={{ width: `${((b.baseCreditScore - 300) / 600) * 100}%` }}
                        />
                        <div
                          className="absolute inset-y-0 left-0 rounded-md"
                          style={{
                            width: `${((b.climateAdjustedScore - 300) / 600) * 100}%`,
                            background: BAND_COLORS[b.riskBand],
                          }}
                        />
                        <span className="absolute right-2 top-1/2 -translate-y-1/2 font-mono text-[10.5px] font-bold text-[#0b1c30] bg-white/80 px-1 rounded">
                          {b.climateAdjustedScore}
                        </span>
                      </div>
                      <span className="font-mono text-[10.5px] text-[#e11d48] w-16 text-right shrink-0">
                        −{b.climateDragPoints} pts
                      </span>
                    </div>
                  ))}
                </div>
              </section>

              {/* ============ TWO-FACTOR ANALYSIS ============ */}
              <section className="bg-white border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[18px] text-[#00685f]">scatter_plot</span>
                  <h2 className="text-[14px] font-bold text-[#0b1c30]">Two-Factor Risk Analysis</h2>
                </div>
                <p className="text-[11.5px] text-[#565e74] mb-3">
                  The climate-adjusted score is generated from two major factors: the company's financial strength (base
                  credit quality, scale) and its climate exposure (flood depth, river proximity, supply downtime,
                  revenue at risk). Top-left companies are lendable green-lights; bottom-right need restructuring or
                  declines.
                </p>
                <svg viewBox="0 0 480 300" className="w-full max-w-[640px] mx-auto">
                  <rect x="40" y="40" width="200" height="110" fill="#ecfdf5" opacity="0.55" />
                  <rect x="240" y="40" width="200" height="110" fill="#fffbeb" opacity="0.55" />
                  <rect x="40" y="150" width="200" height="110" fill="#f8f9ff" opacity="0.55" />
                  <rect x="240" y="150" width="200" height="110" fill="#fff1f2" opacity="0.55" />

                  <line x1="40" y1="150" x2="440" y2="150" stroke="#bcc9c6" strokeDasharray="4,4" />
                  <line x1="240" y1="40" x2="240" y2="260" stroke="#bcc9c6" strokeDasharray="4,4" />

                  <text x="60" y="58" fontSize="9" fontWeight="700" fill="#047857">GREEN-LIGHT LEND</text>
                  <text x="428" y="58" fontSize="9" fontWeight="700" fill="#b45309" textAnchor="end">PRICE FOR CLIMATE RISK</text>
                  <text x="60" y="252" fontSize="9" fontWeight="700" fill="#565e74">MONITOR</text>
                  <text x="428" y="252" fontSize="9" fontWeight="700" fill="#be123c" textAnchor="end">RESTRUCTURE / DECLINE</text>

                  <text x="240" y="278" fontSize="10" fill="#565e74" textAnchor="middle" fontWeight="600">
                    Climate Exposure Index →
                  </text>
                  <text x="22" y="150" fontSize="10" fill="#565e74" textAnchor="middle" fontWeight="600" transform="rotate(-90 22 150)">
                    Company Strength →
                  </text>

                  {selected.map((b) => {
                    const p = idx.get(b.id)!;
                    const cx = 40 + (p.climate / 100) * 400;
                    const cy = 260 - (p.strength / 100) * 220;
                    return (
                      <g key={b.id}>
                        <circle cx={cx} cy={cy} r="7" fill={BAND_COLORS[b.riskBand]} stroke="#fff" strokeWidth="2" />
                        <text x={cx + 10} y={cy + 3.5} fontSize="9.5" fontWeight="700" fill="#0b1c30">
                          {b.name.split(' ').slice(0, 2).join(' ')}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center mt-1">
                  {(['A', 'B', 'C', 'D', 'E'] as RiskGrade[]).map((g) => (
                    <span key={g} className="flex items-center gap-1 font-mono text-[10px] text-[#565e74]">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ background: BAND_COLORS[g] }} />
                      Band {g}
                    </span>
                  ))}
                </div>
              </section>

              {/* ============ THREE-FACTOR ENGINE ============ */}
              <section className="bg-white border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xs">
                <div className="flex items-center gap-2 mb-1">
                  <span className="material-symbols-outlined text-[18px] text-[#00685f]">tune</span>
                  <h2 className="text-[14px] font-bold text-[#0b1c30]">
                    Three-Factor Climate Score Engine — Hazard × Vulnerability × Resilience
                  </h2>
                </div>
                <p className="text-[11.5px] text-[#565e74]">
                  Every climate-adjusted score in Climoid is generated from three factors. They combine as{' '}
                  <span className="font-mono font-semibold text-[#0b1c30]">
                    climate drag ≈ λ · [ Hazard × Vulnerability × (1 − Resilience) ]
                  </span>{' '}
                  — high hazard hitting a vulnerable operation with weak buffers is what pushes PD up and the score down
                  (methodology §2.2–2.3).
                </p>

                <div className="grid grid-cols-3 gap-2.5 mt-3">
                  <div className="border border-rose-200 bg-rose-50/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[16px] text-rose-600">thunderstorm</span>
                      <span className="font-mono text-[11px] font-bold text-rose-800 uppercase tracking-wide">
                        1. Hazard
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3d4947] leading-snug">
                      How likely is a <b>disrupting climate event</b> at this site? Built from modelled flood depth,
                      distance to the waterbody and elevation (Gumbel return levels, HAND terrain, surface-water
                      occurrence).
                    </p>
                  </div>
                  <div className="border border-orange-200 bg-orange-50/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[16px] text-orange-600">factory</span>
                      <span className="font-mono text-[11px] font-bold text-orange-800 uppercase tracking-wide">
                        2. Vulnerability
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3d4947] leading-snug">
                      How much <b>revenue is lost</b> if the event hits? Sector baseline vulnerability amplified by
                      asset attributes, grid fragility and supply-route downtime days.
                    </p>
                  </div>
                  <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-3">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="material-symbols-outlined text-[16px] text-emerald-600">shield</span>
                      <span className="font-mono text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                        3. Resilience
                      </span>
                    </div>
                    <p className="text-[11px] text-[#3d4947] leading-snug">
                      How much of that loss do the borrower's <b>buffers absorb</b>? Insurance, cash cover,
                      diversification and mitigation headroom (noisy-OR of independent buffers).
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-3">
                  {sorted.map((b) => {
                    const p = idx.get(b.id)!;
                    const resLabel = p.res < 35 ? 'limited' : p.res < 60 ? 'moderate' : p.res < 80 ? 'strong' : 'excellent';
                    return (
                      <div key={b.id} className="border border-[#bcc9c6]/30 rounded-xl p-3 bg-[#f8f9ff]">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-[12.5px] font-bold text-[#0b1c30] truncate">{b.name}</span>
                          <span
                            className="shrink-0 font-mono text-[9px] font-bold text-white px-1.5 py-0.5 rounded"
                            style={{ background: BAND_COLORS[b.riskBand] }}
                          >
                            drag −{b.climateDragPoints} pts
                          </span>
                        </div>

                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-2">
                            <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-wide text-rose-700">
                              Hazard
                            </span>
                            <div className="flex-1 h-2.5 bg-white border border-rose-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#e11d48]" style={{ width: `${p.hazard}%` }} />
                            </div>
                            <span className="w-14 text-right font-mono text-[10px] font-bold text-rose-700">
                              {p.hazard}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-wide text-orange-700">
                              Vulnerability
                            </span>
                            <div className="flex-1 h-2.5 bg-white border border-orange-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#f97316]" style={{ width: `${p.vuln}%` }} />
                            </div>
                            <span className="w-14 text-right font-mono text-[10px] font-bold text-orange-700">
                              {p.vuln}/100
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="w-24 shrink-0 font-mono text-[9px] uppercase tracking-wide text-emerald-700">
                              Resilience
                            </span>
                            <div className="flex-1 h-2.5 bg-white border border-emerald-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${p.res}%` }} />
                            </div>
                            <span className="w-14 text-right font-mono text-[10px] font-bold text-emerald-700">
                              {p.res}/100
                            </span>
                          </div>
                        </div>

                        <ul className="mt-2 flex flex-col gap-1 text-[10.5px] text-[#3d4947] leading-snug">
                          <li className="flex gap-1.5">
                            <span className="text-rose-600 font-bold">H:</span>
                            <span>
                              {b.floodDepthModeledM}m modelled flood depth, {b.riverBufferDistanceM}m from the{' '}
                              {b.waterbodyName}, {b.elevationMsl}m elevation → {levelLabel(p.hazard)} probability of a
                              disrupting event.
                            </span>
                          </li>
                          <li className="flex gap-1.5">
                            <span className="text-orange-600 font-bold">V:</span>
                            <span>
                              {b.sector} operations with {b.supplyRouteDowntimeDays}-day supply downtime →{' '}
                              {levelLabel(p.vuln)} revenue loss per event ({b.revenueAtRiskPercent}% of turnover
                              exposed).
                            </span>
                          </li>
                          <li className="flex gap-1.5">
                            <span className="text-emerald-600 font-bold">R:</span>
                            <span>
                              Mitigation headroom of +{b.mitigationScoreDelta} score points, base credit strength{' '}
                              {b.baseCreditScore} and ₹{formatCr(b.annualTurnoverCr)} Cr scale → {resLabel} buffer
                              absorption.
                            </span>
                          </li>
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </section>

              {/* ============ SPEC TABLE ============ */}
              <section className="bg-white border border-[#bcc9c6]/40 rounded-2xl shadow-xs overflow-hidden">
                <div className="overflow-x-auto custom-scroll">
                  <table className="w-full border-collapse min-w-[720px]">
                    <thead>
                      <tr>
                        <th className="sticky left-0 z-10 bg-[#f8f9ff] text-left p-3 border-b border-[#bcc9c6]/30 w-44">
                          <span className="font-mono text-[10px] uppercase tracking-wider text-[#565e74]">
                            Specification
                          </span>
                        </th>
                        {sorted.map((b) => (
                          <th
                            key={b.id}
                            className={`p-3 border-b border-l border-[#bcc9c6]/30 min-w-[180px] ${
                              winner?.id === b.id ? 'bg-emerald-50' : 'bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div className="min-w-0">
                                <div className="text-[12.5px] font-bold text-[#0b1c30] leading-tight">{b.name}</div>
                                <div className="font-mono text-[10px] text-[#6d7a77] mt-0.5">{b.msmeId}</div>
                              </div>
                              <div className="flex flex-col items-end gap-1 shrink-0">
                                <span
                                  className="font-mono text-[10px] font-bold text-white px-1.5 rounded"
                                  style={{ background: BAND_COLORS[b.riskBand] }}
                                >
                                  {b.riskBand}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onOpenBorrower(b)}
                                  className="material-symbols-outlined text-[15px] text-[#00685f] hover:bg-[#e5eeff] rounded"
                                  title="Open underwriting file"
                                >
                                  open_in_new
                                </button>
                              </div>
                            </div>
                            {winner?.id === b.id && (
                              <div className="mt-1.5 inline-flex items-center gap-1 font-mono text-[9px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-300 rounded px-1.5 py-0.5">
                                <span className="material-symbols-outlined text-[11px]">emoji_events</span>
                                LOWEST RISK
                              </div>
                            )}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allGroups.map((group) => (
                        <React.Fragment key={group.title}>
                          <tr>
                            <td
                              colSpan={sorted.length + 1}
                              className="p-2 bg-[#f8f9ff] border-b border-[#bcc9c6]/30"
                            >
                              <div className="flex items-center gap-1.5">
                                <span className="material-symbols-outlined text-[14px] text-[#00685f]">{group.icon}</span>
                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[#00685f]">
                                  {group.title}
                                </span>
                                <span className="ml-2 flex items-center gap-2 font-mono text-[9px]">
                                  <span className="text-emerald-700">■ best</span>
                                  <span className="text-rose-700">■ worst</span>
                                </span>
                              </div>
                            </td>
                          </tr>
                          {group.rows.map((row) => {
                            const { bestId, worstId } = bestWorst(row);
                            return (
                              <tr key={row.label} className="hover:bg-[#f8f9ff]/60">
                                <td className="sticky left-0 z-10 bg-white p-2.5 pl-3 border-b border-[#bcc9c6]/20 font-mono text-[10.5px] text-[#565e74]">
                                  {row.label}
                                </td>
                                {sorted.map((b) => {
                                  const isBest = bestId === b.id;
                                  const isWorst = worstId === b.id;
                                  return (
                                    <td
                                      key={b.id}
                                      className={`p-2.5 border-b border-l border-[#bcc9c6]/20 text-[12px] align-top ${
                                        isBest
                                          ? 'bg-emerald-50 text-emerald-900 font-semibold'
                                          : isWorst
                                            ? 'bg-rose-50 text-rose-900 font-semibold'
                                            : 'text-[#0b1c30]'
                                      }`}
                                    >
                                      {row.render(b)}
                                    </td>
                                  );
                                })}
                              </tr>
                            );
                          })}
                        </React.Fragment>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {/* ============ EXPLANATIONS ============ */}
              <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#00685f]">psychology</span>
                  <h2 className="text-[14px] font-bold text-[#0b1c30]">
                    Why each score looks the way it does — full explanation
                  </h2>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {sorted.map((b) => {
                    const p = idx.get(b.id)!;
                    return (
                      <div
                        key={b.id}
                        className="bg-white border border-[#bcc9c6]/40 rounded-2xl p-4 shadow-xs flex flex-col gap-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="text-[13.5px] font-bold text-[#0b1c30] leading-tight">{b.name}</div>
                          <span
                            className="shrink-0 font-mono text-[10px] font-bold text-white px-2 py-1 rounded-full"
                            style={{ background: BAND_COLORS[b.riskBand] }}
                          >
                            Band {b.riskBand} • {b.riskCategory}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <div className="flex-1 bg-[#fff1f2] border border-rose-100 rounded-lg px-2.5 py-1.5">
                            <div className="font-mono text-[9px] uppercase text-rose-700">Climate Exposure Index</div>
                            <div className="font-mono text-[16px] font-bold text-rose-800">{p.climate}/100</div>
                          </div>
                          <div className="flex-1 bg-[#ecfdf5] border border-emerald-100 rounded-lg px-2.5 py-1.5">
                            <div className="font-mono text-[9px] uppercase text-emerald-700">Company Strength Index</div>
                            <div className="font-mono text-[16px] font-bold text-emerald-800">{p.strength}/100</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[10px]">
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 rounded px-1.5 py-0.5">
                            Hazard {p.hazard}
                          </span>
                          <span className="bg-orange-50 text-orange-700 border border-orange-200 rounded px-1.5 py-0.5">
                            Vuln {p.vuln}
                          </span>
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded px-1.5 py-0.5">
                            Resil {p.res}
                          </span>
                        </div>
                        <p className="text-[12px] text-[#3d4947] leading-relaxed">
                          <span className="font-semibold text-[#0b1c30]">
                            {b.sector} in {b.district}.{' '}
                          </span>
                          {sectorBlurb(b.sector)}{' '}
                          The site sits {b.riverBufferDistanceM}m from the {b.waterbodyName} with{' '}
                          {b.floodDepthModeledM}m modelled flood depth and {b.supplyRouteDowntimeDays} days of
                          supply-route downtime, putting {b.revenueAtRiskPercent}% of ₹{formatCr(b.annualTurnoverCr)} Cr
                          turnover at risk. Climate exposure drags the score by {b.climateDragPoints} points
                          (−{b.climateDragPercent}%), lifting 12-month PD from {b.basePdPercent}% to{' '}
                          {b.adjustedPdPercent}%. Climoid recommends lending at +{b.recommendedSpreadAdjustmentBps} bps
                          with {b.recommendedCovenants.length} climate covenant
                          {b.recommendedCovenants.length === 1 ? '' : 's'}.
                        </p>
                      </div>
                    );
                  })}
                </div>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
