import React, { useState } from 'react';
import { BorrowerRecord, HazardType } from '../types';
import { TOP_AT_RISK_BORROWERS, PRIMARY_BORROWER } from '../data/mockData';

interface DashboardViewProps {
  onUnderwriteBorrower: (borrower: BorrowerRecord) => void;
  onNavigateToAlerts: () => void;
  onNavigateToScenarios: () => void;
  onNavigateToMap: () => void;
}

export function DashboardView({
  onUnderwriteBorrower,
  onNavigateToAlerts,
  onNavigateToScenarios,
  onNavigateToMap,
}: DashboardViewProps) {
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('flood');
  const [forecastHorizon, setForecastHorizon] = useState<number>(2); // T+2
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'district' | 'geocodes'>('district');
  const [page, setPage] = useState<number>(1);
  const [filterSector, setFilterSector] = useState<string>('all');

  const filteredBorrowers = filterSector === 'all' 
    ? TOP_AT_RISK_BORROWERS 
    : TOP_AT_RISK_BORROWERS.filter(b => b.sector.toLowerCase().includes(filterSector.toLowerCase()));

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto select-none">
      {/* Screen Sub-Header & Status Ribbon */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-[22px] font-bold text-[#0b1c30] tracking-tight">Portfolio Underwriting Overview</h1>
          <p className="text-[13px] text-[#565e74]">
            Institutional climate-stress monitoring across India MSME credit tranches
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-md border border-[#bcc9c6]/40 text-[12px] text-[#565e74]">
          <span className="font-medium text-[#0b1c30]">Monsoon Active Cycle</span>
          <span className="text-[#bcc9c6]">|</span>
          <span className="font-mono text-[11px]">IMD Nowcast v4.2</span>
        </div>
      </div>

      {/* TOP KPI SUMMARY ROW (5 CARDS) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* KPI 1: Portfolio Climate Score */}
        <div className="bg-white p-4 rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#565e74]">Portfolio Climate Score</span>
            <span className="text-[11px] text-[#565e74]">Weighted Aggregate</span>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div>
              <div className="font-mono text-[30px] font-bold text-[#0b1c30] leading-none">
                72<span className="text-[16px] text-[#565e74] font-normal">/100</span>
              </div>
              <div className="flex items-center gap-1 mt-1 text-[11px] text-rose-700">
                <span className="font-mono">-4.2 pts</span>
                <span className="text-[#565e74]">vs Q3 benchmark</span>
              </div>
            </div>
            <div className="text-right text-[11px] text-[#565e74] border-l border-[#eceef0] pl-3">
              <div>Ceiling: 65.0</div>
              <div className="font-medium text-amber-700 mt-0.5">Watch Tier</div>
            </div>
          </div>
        </div>

        {/* KPI 2: Borrowers at High Climate Risk */}
        <div className="bg-white p-4 rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#565e74] font-medium">Borrowers at High Risk</span>
            <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded font-bold border border-rose-200">
              ALERT
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[30px] font-bold text-[#0b1c30] leading-none">
              142 <span className="text-[14px] font-normal text-[#565e74]">MSMEs</span>
            </div>
            <div className="flex items-center justify-between mt-1 font-mono text-[11px] text-[#565e74]">
              <span>11.1% of 1,280 book</span>
              <span className="text-rose-700 font-semibold">+18 this cycle</span>
            </div>
          </div>
        </div>

        {/* KPI 3: Expected Revenue-at-Risk */}
        <div className="bg-white p-4 rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#565e74] font-medium">Expected Rev-at-Risk</span>
            <span className="font-mono text-[10px] bg-[#f2f4f6] text-[#565e74] px-1.5 py-0.5 rounded font-semibold">
              7-DAY
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[30px] font-bold text-[#0b1c30] leading-none">
              ₹48.6 <span className="text-[15px] font-normal text-[#565e74]">Cr</span>
            </div>
            <div className="flex items-center gap-1 mt-1 font-mono text-[11px] text-[#565e74]">
              <span className="material-symbols-outlined text-[14px] text-[#006194]">water_drop</span>
              <span>Monsoon spike exposure</span>
            </div>
          </div>
        </div>

        {/* KPI 4: Active Climate Alerts */}
        <div className="bg-white p-4 rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#565e74] font-medium">Active Climate Alerts</span>
            <span className="font-mono text-[10px] bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded font-semibold border border-blue-200">
              MULTI-STATE
            </span>
          </div>
          <div className="mt-2">
            <div className="font-mono text-[30px] font-bold text-[#0b1c30] flex items-baseline gap-1.5 leading-none">
              <span className="text-rose-700">8</span>
              <span className="text-[12px] font-normal text-[#565e74]">Urgent</span>
              <span className="text-[#565e74] font-normal text-[16px]">/ 23</span>
              <span className="text-[12px] font-normal text-[#565e74]">Adv</span>
            </div>
            <div className="font-mono text-[11px] text-[#565e74] mt-1 truncate">
              MH & GJ industrial belts
            </div>
          </div>
        </div>

        {/* KPI 5: Climate-Adjusted PD vs Base PD */}
        <div className="bg-white p-4 rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[12px] text-[#565e74] font-medium">Adjusted PD vs Base PD</span>
            <span className="font-mono text-[10px] bg-[#f2f4f6] text-[#565e74] px-1.5 py-0.5 rounded font-semibold">
              DELTA
            </span>
          </div>
          <div className="mt-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-[14px] text-[#565e74] line-through">2.14%</span>
              <span className="material-symbols-outlined text-[14px] text-[#565e74]">arrow_forward</span>
              <span className="font-mono text-[24px] font-bold text-[#0b1c30]">3.82%</span>
            </div>
            <div className="font-mono text-[11px] text-rose-700 font-medium mt-1">
              Delta +1.68% (stress factor)
            </div>
          </div>
        </div>
      </section>

      {/* MAIN CONTENT GRID: 2/3 MAP + 1/3 LIVE ALERTS FEED */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT / CENTER: Interactive Sub-national India Hazard Overlay (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col overflow-hidden">
          {/* Controls Bar */}
          <div className="p-3.5 border-b border-[#eceef0] flex flex-wrap items-center justify-between gap-3 bg-white">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#00685f]">explore</span>
              <span className="font-semibold text-[15px] text-[#0b1c30]">Sub-national India Hazard Overlay</span>
            </div>

            {/* Layer Selectors */}
            <div className="flex items-center gap-1 bg-[#f2f4f6] p-1 rounded-lg font-mono text-[11px]">
              {(['flood', 'heat', 'drought', 'storm', 'satellite'] as HazardType[]).map((layer) => {
                const isSelected = selectedHazard === layer;
                const icons: Record<HazardType, string> = {
                  flood: 'flood',
                  heat: 'thermostat',
                  drought: 'water_loss',
                  storm: 'cyclone',
                  satellite: 'satellite_alt'
                };
                const labels: Record<HazardType, string> = {
                  flood: 'Flood',
                  heat: 'Heat',
                  drought: 'Drought',
                  storm: 'Storm',
                  satellite: 'Satellite Extent'
                };
                return (
                  <button
                    key={layer}
                    type="button"
                    onClick={() => setSelectedHazard(layer)}
                    className={`px-2.5 py-1 rounded flex items-center gap-1 transition-all ${
                      isSelected
                        ? 'bg-white text-[#00685f] shadow-xs font-semibold'
                        : 'text-[#565e74] hover:text-[#0b1c30]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px]">{icons[layer]}</span>
                    <span>{labels[layer]}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Map Vector Graphic Area */}
          <div className="relative w-full h-[400px] bg-[#f2f5f8] overflow-hidden flex items-center justify-center">
            {/* Grid Pattern */}
            <div
              className="absolute inset-0 opacity-40 pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(#bcc9c6 1px, transparent 1px)',
                backgroundSize: '24px 24px',
              }}
            ></div>

            {/* Stylized SVG Map of Western & Peninsular India */}
            <svg className="absolute inset-0 w-full h-full text-[#bcc9c6]/40 pointer-events-none" fill="none" viewBox="0 0 800 450">
              <path d="M220,40 Q260,110 280,180 T290,320 T360,420" stroke="currentColor" strokeWidth="1.5" strokeDasharray="4 4" />
              <path d="M290,180 Q390,210 520,190 T680,240" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
              <path d="M190,140 Q220,190 230,260 T250,380" stroke="#007bb9" strokeWidth="1.5" opacity="0.5" />

              {/* Heatmap Isoclines */}
              <circle cx="280" cy="220" r="70" fill="#ba1a1a" fillOpacity="0.08" />
              <circle cx="280" cy="220" r="110" fill="#ba1a1a" fillOpacity="0.04" />
              <circle cx="230" cy="150" r="60" fill="#008378" fillOpacity="0.08" />
              <circle cx="380" cy="240" r="90" fill="#dae2fd" fillOpacity="0.3" />
            </svg>

            {/* Interactive Pins */}
            {/* Pin 1: Pune Corridor (Critical 37) */}
            <div
              className="absolute top-[52%] left-[34%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              onMouseEnter={() => setActiveTooltip('pune')}
              onMouseLeave={() => setActiveTooltip(null)}
              onClick={onNavigateToMap}
            >
              <div className="relative flex items-center justify-center">
                <span className="animate-ping absolute inline-flex h-8 w-8 rounded-full bg-rose-500 opacity-40"></span>
                <div className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center font-mono text-[12px] font-bold shadow-sm">
                  37
                </div>
              </div>

              {/* Tooltip */}
              {activeTooltip === 'pune' && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 flex flex-col bg-white p-2.5 rounded-lg border border-[#bcc9c6]/50 shadow-lg w-52 z-30 pointer-events-none text-[12px]">
                  <div className="flex items-center justify-between pb-1 border-b border-[#eceef0]">
                    <span className="font-semibold text-[#0b1c30]">Pune / Pimpri Cluster</span>
                    <span className="font-mono text-[9px] text-rose-800 bg-rose-100 px-1 rounded font-bold">SEVERE</span>
                  </div>
                  <div className="text-[#565e74] mt-1 flex justify-between">
                    <span>Exposed Facilities:</span>
                    <span className="font-mono text-[#0b1c30] font-semibold">37 Borrowers</span>
                  </div>
                  <div className="text-[#565e74] flex justify-between">
                    <span>Rev-at-Risk:</span>
                    <span className="font-mono text-rose-700 font-semibold">₹18.4 Cr</span>
                  </div>
                </div>
              )}
            </div>

            {/* Pin 2: Surat / Bharuch (21) */}
            <div 
              className="absolute top-[38%] left-[29%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              onClick={onNavigateToMap}
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm">
                21
              </div>
            </div>

            {/* Pin 3: Vidarbha Industrial (18) */}
            <div 
              className="absolute top-[48%] left-[48%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              onClick={onNavigateToMap}
            >
              <div className="w-5 h-5 rounded-full bg-rose-600 text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm">
                18
              </div>
            </div>

            {/* Pin 4: Bengaluru (44) */}
            <div 
              className="absolute top-[75%] left-[42%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              onClick={onNavigateToMap}
            >
              <div className="w-5 h-5 rounded-full bg-[#00685f] text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm">
                44
              </div>
            </div>

            {/* Pin 5: Chennai (14) */}
            <div 
              className="absolute top-[73%] left-[54%] transform -translate-x-1/2 -translate-y-1/2 group cursor-pointer z-10"
              onClick={onNavigateToMap}
            >
              <div className="w-5 h-5 rounded-full bg-amber-500 text-white flex items-center justify-center font-mono text-[11px] font-bold shadow-sm">
                14
              </div>
            </div>

            {/* Floating Legend */}
            <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-xs p-3 rounded-lg border border-[#bcc9c6]/40 text-[11px] flex flex-col gap-1.5 shadow-xs">
              <div className="font-mono text-[10px] text-[#565e74] font-semibold uppercase tracking-wider">Cluster Climate Score</div>
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <span>Critical Risk (&lt; 40)</span>
              </div>
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                <span>Watch Tier (40 - 69)</span>
              </div>
              <div className="flex items-center gap-2 text-[#0b1c30]">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                <span>Resilient Tier (70+)</span>
              </div>
            </div>

            {/* View Mode Switcher */}
            <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur-xs p-1 rounded-lg border border-[#bcc9c6]/40 text-[11px] font-mono shadow-xs">
              <button
                type="button"
                onClick={() => setViewMode('district')}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewMode === 'district' ? 'bg-[#eceef0] text-[#0b1c30] font-semibold' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                District Heatmap
              </button>
              <button
                type="button"
                onClick={() => setViewMode('geocodes')}
                className={`px-2 py-0.5 rounded transition-all ${
                  viewMode === 'geocodes' ? 'bg-[#eceef0] text-[#0b1c30] font-semibold' : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                Asset Geocodes
              </button>
            </div>
          </div>

          {/* 7-Day Forecast Horizon Time Scrubber */}
          <div className="p-3 bg-[#f2f4f6] border-t border-[#eceef0] flex flex-col gap-2">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <div className="flex items-center gap-1.5 text-[#0b1c30] font-medium">
                <span className="material-symbols-outlined text-[16px] text-[#00685f]">schedule</span>
                <span>
                  FORECAST HORIZON: <strong className="text-[#00685f]">T+{forecastHorizon * 24} Hours (Precipitation Peak)</strong>
                </span>
              </div>
              <span className="text-[#565e74]">ECMWF / IMD ENS Run 06Z</span>
            </div>

            <div className="flex items-center gap-4">
              <span className="font-mono text-[11px] text-[#565e74]">T+0h</span>
              <div className="relative flex-1 flex items-center">
                <input
                  type="range"
                  min="0"
                  max="7"
                  value={forecastHorizon}
                  onChange={(e) => setForecastHorizon(Number(e.target.value))}
                  className="w-full h-1.5 bg-[#d8dadc] rounded-lg appearance-none cursor-pointer accent-[#00685f]"
                />
              </div>
              <span className="font-mono text-[11px] text-[#565e74]">T+7d</span>
            </div>

            <div className="flex justify-between px-6 font-mono text-[10px] text-[#565e74]">
              <span className={forecastHorizon === 0 ? 'text-[#00685f] font-bold' : ''}>Today (Live)</span>
              <span className={forecastHorizon === 1 ? 'text-[#00685f] font-bold' : ''}>T+1 (Heavy)</span>
              <span className={forecastHorizon === 2 ? 'text-rose-700 font-bold' : ''}>T+2 (Peak Flood)</span>
              <span className={forecastHorizon === 3 ? 'text-[#00685f] font-bold' : ''}>T+3</span>
              <span className={forecastHorizon === 4 ? 'text-[#00685f] font-bold' : ''}>T+4</span>
              <span className={forecastHorizon === 5 ? 'text-[#00685f] font-bold' : ''}>T+5</span>
              <span className={forecastHorizon === 6 ? 'text-[#00685f] font-bold' : ''}>T+6</span>
              <span className={forecastHorizon === 7 ? 'text-[#00685f] font-bold' : ''}>T+7</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Live Climate Alerts Feed (1 col) */}
        <div className="bg-white rounded-xl border border-[#bcc9c6]/30 shadow-xs flex flex-col h-[520px]">
          <div className="p-4 border-b border-[#eceef0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-rose-600 text-[20px]">crisis_alert</span>
              <h2 className="font-semibold text-[15px] text-[#0b1c30]">Live Climate Alerts</h2>
            </div>
            <span className="font-mono text-[10px] text-[#565e74] bg-[#f2f4f6] px-2 py-0.5 rounded font-semibold">
              REAL-TIME FEED
            </span>
          </div>

          {/* Alert items container */}
          <div className="flex-1 overflow-y-auto divide-y divide-[#eceef0] p-2 flex flex-col gap-1 text-[12px]">
            {/* Alert 1 */}
            <div className="p-3 rounded-lg hover:bg-[#f2f4f6] transition-colors flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold border border-rose-200">
                  HIGH FLOOD RISK
                </span>
                <span className="font-mono text-[11px] text-[#565e74]">12m ago</span>
              </div>
              <div>
                <div className="font-semibold text-[13px] text-[#0b1c30]">Heavy rainfall warning in Pune district (next 48h)</div>
                <p className="text-[#565e74] mt-0.5 leading-relaxed">
                  IMD orange alert: &gt;115mm/24h expected across Mutha basin. 37 borrowers exposed in MIDC auto belts.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <span className="text-[#565e74]">Rev-at-Risk: <strong className="text-[#0b1c30]">₹18.4 Cr</strong></span>
                <button 
                  onClick={onNavigateToAlerts}
                  className="text-[#00685f] hover:underline flex items-center gap-0.5 font-semibold"
                >
                  <span>Inspect Cohort</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Alert 2 */}
            <div className="p-3 rounded-lg hover:bg-[#f2f4f6] transition-colors flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-bold border border-amber-200">
                  HEAT & POWER STRESS
                </span>
                <span className="font-mono text-[11px] text-[#565e74]">1h ago</span>
              </div>
              <div>
                <div className="font-semibold text-[13px] text-[#0b1c30]">Heatwave advisory Vidarbha — Cold chain power stress</div>
                <p className="text-[#565e74] mt-0.5 leading-relaxed">
                  Temperatures exceeding 44.5°C affecting 19 agro-processing units. Tripping risk on industrial 33kV feeders.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <span className="text-[#565e74]">Rev-at-Risk: <strong className="text-[#0b1c30]">₹9.2 Cr</strong></span>
                <button 
                  onClick={onNavigateToAlerts}
                  className="text-[#00685f] hover:underline flex items-center gap-0.5 font-semibold"
                >
                  <span>Inspect Cohort</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Alert 3 */}
            <div className="p-3 rounded-lg hover:bg-[#f2f4f6] transition-colors flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] bg-rose-100 text-rose-800 px-1.5 py-0.2 rounded font-bold border border-rose-200">
                  STORM RUNOFF
                </span>
                <span className="font-mono text-[11px] text-[#565e74]">3h ago</span>
              </div>
              <div>
                <div className="font-semibold text-[13px] text-[#0b1c30]">Narmada estuary high discharge in Bharuch</div>
                <p className="text-[#565e74] mt-0.5 leading-relaxed">
                  Sardar Sarovar spillway releases coincide with spring tide. 14 chemical manufacturing facilities on watch.
                </p>
              </div>
              <div className="flex items-center justify-between pt-1 font-mono text-[11px]">
                <span className="text-[#565e74]">Rev-at-Risk: <strong className="text-[#0b1c30]">₹12.1 Cr</strong></span>
                <button 
                  onClick={onNavigateToAlerts}
                  className="text-[#00685f] hover:underline flex items-center gap-0.5 font-semibold"
                >
                  <span>Inspect Cohort</span>
                  <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                </button>
              </div>
            </div>
          </div>

          <div className="p-3 bg-[#f8f9ff] border-t border-[#eceef0] text-center">
            <button
              type="button"
              onClick={onNavigateToAlerts}
              className="text-[12px] text-[#00685f] hover:text-[#008378] font-semibold"
            >
              View all 31 active alerts →
            </button>
          </div>
        </div>
      </div>

      {/* BOTTOM SECTION: TOP 10 AT-RISK BORROWERS TABLE */}
      <section className="bg-white rounded-xl border border-[#bcc9c6]/30 shadow-xs overflow-hidden mb-6">
        <div className="p-4 border-b border-[#eceef0] flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold text-[16px] text-[#0b1c30]">Top 10 At-Risk Borrowers</h2>
            <p className="text-[12px] text-[#565e74]">
              Highest 7-day revenue-at-risk exposures under current meteorological projections
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFilterSector(filterSector === 'all' ? 'auto' : 'all')}
              className="px-3 h-8 bg-[#f2f4f6] text-[#0b1c30] text-[12px] font-medium rounded-lg hover:bg-[#e5eeff] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>{filterSector === 'all' ? 'Filter Sector' : 'Clear Filter'}</span>
            </button>
            <button
              type="button"
              onClick={onNavigateToScenarios}
              className="px-3 h-8 bg-[#f2f4f6] text-[#0b1c30] text-[12px] font-medium rounded-lg hover:bg-[#e5eeff] transition-colors flex items-center gap-1.5"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Stress Scenarios</span>
            </button>
          </div>
        </div>

        {/* High-Density Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#eceef0] font-mono text-[11px] text-[#565e74] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Borrower Name</th>
                <th className="py-2.5 px-4 font-semibold">Sector</th>
                <th className="py-2.5 px-4 text-right font-semibold">Facility (₹ Cr)</th>
                <th className="py-2.5 px-4 font-semibold">Location</th>
                <th className="py-2.5 px-4 text-center font-semibold">Climate Score</th>
                <th className="py-2.5 px-4 text-right font-semibold">7-Day Rev-at-Risk</th>
                <th className="py-2.5 px-4 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {filteredBorrowers.map((borrower) => (
                <tr key={borrower.id} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3 px-4 font-medium text-[#0b1c30]">
                    <div className="font-semibold">{borrower.name}</div>
                    <div className="font-mono text-[11px] text-[#6d7a77]">ID: {borrower.msmeId}</div>
                  </td>
                  <td className="py-3 px-4 text-[#565e74]">{borrower.sector}</td>
                  <td className="py-3 px-4 text-right font-mono font-medium text-[#0b1c30]">
                    {borrower.facilityAmountCr.toFixed(2)}
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1 text-[#565e74]">
                      <span className="material-symbols-outlined text-[14px] text-rose-600">location_on</span>
                      {borrower.location}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded font-mono text-[11px] font-semibold ${
                      borrower.climateAdjustedScore < 600
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : borrower.climateAdjustedScore < 650
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-[#eceef0] text-[#0b1c30]'
                    }`}>
                      {borrower.climateAdjustedScore} / 900
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-rose-700 font-semibold">
                    ₹{borrower.revenueAtRiskCr.toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onUnderwriteBorrower(borrower)}
                      className="text-[#00685f] hover:text-[#008378] font-semibold hover:underline inline-flex items-center gap-0.5"
                    >
                      <span>Underwrite</span>
                      <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="p-3.5 bg-[#f8f9ff] border-t border-[#eceef0] flex items-center justify-between text-[12px] text-[#565e74]">
          <div>Showing top 10 of 142 flagged accounts • Total cohort exposure: ₹120.30 Cr</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 bg-white border border-[#bcc9c6]/40 rounded font-mono text-[11px] text-[#0b1c30] hover:bg-[#f2f4f6] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">Page {page} of 15</span>
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1 bg-white border border-[#bcc9c6]/40 rounded font-mono text-[11px] text-[#0b1c30] hover:bg-[#f2f4f6]"
            >
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
