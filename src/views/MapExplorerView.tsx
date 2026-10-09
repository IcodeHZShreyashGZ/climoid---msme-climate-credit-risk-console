import React, { useState } from 'react';
import { HazardType, RiskGrade, BorrowerRecord } from '../types';
import { PRIMARY_BORROWER } from '../data/mockData';

interface MapExplorerViewProps {
  onOpenUnderwritingFile: (borrower: BorrowerRecord) => void;
  onExportDossier: () => void;
}

export function MapExplorerView({ onOpenUnderwritingFile, onExportDossier }: MapExplorerViewProps) {
  // Hazard layer selection
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('flood');
  const [satelliteMode, setSatelliteMode] = useState<'satellite' | 'terrain'>('satellite');
  const [forecastDay, setForecastDay] = useState<number>(2); // +2D Peak Flood
  const [isPlayingScrubber, setIsPlayingScrubber] = useState<boolean>(false);

  // Filter drawer states
  const [selectedState, setSelectedState] = useState('Maharashtra — Pune & Satara');
  const [loanSizeRange, setLoanSizeRange] = useState<number>(1500); // 15 Cr max
  const [sectors, setSectors] = useState({
    agro: true,
    textiles: true,
    chemicals: true,
    auto: false,
  });
  const [selectedRiskBand, setSelectedRiskBand] = useState<RiskGrade>('D');
  const [waterProximity, setWaterProximity] = useState('< 500m to Major River/Basin');
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(true);

  // Inspector drawer state
  const [inspectorOpen, setInspectorOpen] = useState(true);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activePin, setActivePin] = useState<'maa-gayatri' | 'sahyadri' | 'kisan' | 'baramati-cluster' | 'jejuri-cluster'>('maa-gayatri');

  const togglePlayback = () => {
    setIsPlayingScrubber(!isPlayingScrubber);
  };

  const handleResetFilter = () => {
    setSelectedState('Maharashtra — Pune & Satara');
    setLoanSizeRange(1500);
    setSectors({ agro: true, textiles: true, chemicals: true, auto: true });
    setSelectedRiskBand('D');
    setWaterProximity('< 500m to Major River/Basin');
  };

  return (
    <div className="fixed top-14 left-64 right-0 bottom-0 overflow-hidden bg-[#f7f9fb] flex flex-col select-none">
      {/* ================= SUB-BAR 1: GEOSPATIAL CONTROLS & TIME SCRUBBER ================= */}
      <div className="h-12 bg-white/95 backdrop-blur-xs border-b border-[#bcc9c6]/30 px-6 flex items-center justify-between z-10 shrink-0">
        {/* Climate Risk Hazards Layer Selector */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-[#565e74] uppercase tracking-wider mr-1">HAZARD LAYERS:</span>

          <button
            type="button"
            onClick={() => setSelectedHazard('flood')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              selectedHazard === 'flood'
                ? 'bg-[#cce5ff] text-[#004b73] border border-[#007bb9]/30'
                : 'bg-white text-[#565e74] border border-[#bcc9c6]/40 hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-[#006194]"></span>
            <span>Flood Inundation (100-Yr)</span>
            {selectedHazard === 'flood' && <span className="material-symbols-outlined text-[13px]">check</span>}
          </button>

          <button
            type="button"
            onClick={() => setSelectedHazard('heat')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              selectedHazard === 'heat'
                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                : 'bg-white text-[#565e74] border border-[#bcc9c6]/40 hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>Extreme Heat Index</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedHazard('drought')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              selectedHazard === 'drought'
                ? 'bg-orange-100 text-orange-900 border border-orange-300'
                : 'bg-white text-[#565e74] border border-[#bcc9c6]/40 hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-600"></span>
            <span>Drought/Aquifer Deficit</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedHazard('storm')}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-mono font-medium transition-all ${
              selectedHazard === 'storm'
                ? 'bg-teal-100 text-teal-900 border border-teal-300'
                : 'bg-white text-[#565e74] border border-[#bcc9c6]/40 hover:text-[#0b1c30]'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-teal-600"></span>
            <span>Severe Cyclone/Storm</span>
          </button>
        </div>

        {/* Right Sub-Controls: Satellite/Terrain & Dynamic Time Scrubber */}
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-[#f2f4f6] border border-[#bcc9c6]/40 rounded p-0.5">
            <button
              type="button"
              onClick={() => setSatelliteMode('terrain')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                satelliteMode === 'terrain' ? 'bg-white text-[#0b1c30] font-semibold shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Terrain
            </button>
            <button
              type="button"
              onClick={() => setSatelliteMode('satellite')}
              className={`px-2 py-0.5 rounded text-[11px] font-mono ${
                satelliteMode === 'satellite' ? 'bg-white text-[#0b1c30] font-semibold shadow-xs' : 'text-[#565e74] hover:text-[#0b1c30]'
              }`}
            >
              Hybrid Satellite
            </button>
          </div>

          <div className="h-4 w-px bg-[#bcc9c6]/40"></div>

          {/* 30-Day to Next 7-Day Time Scrubber */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-6 h-6 rounded bg-[#f2f4f6] flex items-center justify-center text-[#00685f] hover:bg-[#e5eeff] transition-colors"
              title="Play temporal evolution"
            >
              <span className="material-symbols-outlined text-[16px]">
                {isPlayingScrubber ? 'pause' : 'play_arrow'}
              </span>
            </button>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-[#565e74]">-30D</span>
              <div className="relative w-28 h-1.5 bg-[#d8dadc] rounded-full overflow-hidden">
                <div className="absolute left-0 top-0 bottom-0 w-4/5 bg-[#00685f] rounded-full"></div>
                <div className="absolute left-[80%] top-1/2 -translate-y-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-[#0b1c30] rounded-full border border-white"></div>
              </div>
              <span className="font-mono text-[10px] text-[#0b1c30] font-semibold">+7D FCST</span>
            </div>
            <span className="font-mono text-[10px] text-[#00685f] bg-[#89f5e7]/30 px-1.5 py-0.5 rounded font-medium">
              T+48h Model
            </span>
          </div>
        </div>
      </div>

      {/* ================= SUB-BAR 2: ACTIVE VIEWPORT SUMMARY BANNER ================= */}
      <div className="h-9 bg-[#f2f4f6] border-b border-[#bcc9c6]/30 px-6 flex items-center justify-between text-[12px] z-10 shrink-0">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></span>
            <span className="text-[#565e74] font-mono text-[11px]">BOUNDING BOX:</span>
            <span className="font-mono text-[12px] font-medium text-[#0b1c30]">Pune-Baramati Industrial Belt [18.15°N, 74.57°E]</span>
          </div>
          <div className="h-3 w-px bg-[#bcc9c6]/40"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#565e74] font-mono text-[11px]">PORTFOLIO EXPOSURE:</span>
            <span className="font-mono text-[11px] bg-white border border-[#bcc9c6]/40 px-1.5 py-0.2 rounded font-medium text-[#0b1c30]">
              142 MSMEs
            </span>
            <span className="text-[#565e74]">|</span>
            <span className="font-mono text-[12px] font-semibold text-[#0b1c30]">₹184.50 Cr</span>
            <span className="text-[#565e74] font-mono text-[11px]">Debt Outstanding</span>
          </div>
          <div className="h-3 w-px bg-[#bcc9c6]/40"></div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded font-semibold">
              HIGH HAZARD: 29 Borrowers
            </span>
            <span className="font-mono text-[12px] text-rose-700 font-semibold">(₹48.2 Cr At Risk)</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[#565e74] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
            IMD HydroNet Sync: 4m ago
          </span>
        </div>
      </div>

      {/* ================= WORKBENCH BODY: MAP CANVAS + DRAWERS ================= */}
      <div className="flex-1 relative overflow-hidden bg-[#eef3f1]">
        {/* Cartographic Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-40 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <pattern id="map-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" stroke="#cbd5e1" strokeDasharray="2,3" strokeWidth="0.75" />
            </pattern>
            <linearGradient id="floodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#006194" stopOpacity="0.35" />
              <stop offset="50%" stopColor="#007bb9" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#93ccff" stopOpacity="0.06" />
            </linearGradient>
            <linearGradient id="heatGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ba1a1a" stopOpacity="0.25" />
              <stop offset="60%" stopColor="#f59e0b" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#fef08a" stopOpacity="0.0" />
            </linearGradient>
          </defs>
          <rect width="100%" height="100%" fill="url(#map-grid)" />
        </svg>

        {/* Simulated Hydrographic Vector Layers */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1400 800" preserveAspectRatio="none">
          {/* Karha River Drainage Basin */}
          <path d="M-50,320 Q240,290 480,410 T920,440 T1450,380" fill="none" stroke="#93ccff" strokeWidth="26" opacity="0.6" strokeLinecap="round" />
          <path d="M-50,320 Q240,290 480,410 T920,440 T1450,380" fill="none" stroke="#007bb9" strokeWidth="6" opacity="0.85" strokeLinecap="round" />

          {/* 100-Year Fluvial Flood Inundation Envelope */}
          <path d="M 320,340 C 440,310 590,360 670,430 C 740,490 820,530 920,490 C 860,560 710,580 580,520 C 460,460 380,420 320,340 Z" fill="url(#floodGrad)" stroke="#006194" strokeWidth="1.5" strokeDasharray="4,3" />

          {/* Microclimate Heat Anomaly Contour */}
          <circle cx="880" cy="260" r="180" fill="url(#heatGrad)" />
          <circle cx="880" cy="260" r="120" fill="none" stroke="#f59e0b" strokeWidth="1" strokeDasharray="3,3" opacity="0.5" />

          {/* Elevation Contours */}
          <path d="M100,600 C 350,560 700,690 1200,610" fill="none" stroke="#bcc9c6" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
          <path d="M220,180 C 510,120 850,220 1350,150" fill="none" stroke="#bcc9c6" strokeWidth="1" strokeDasharray="4,4" opacity="0.5" />
        </svg>

        {/* Geospatial Annotations on Map */}
        <div className="absolute left-[540px] top-[415px] pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-widest text-[#006194] font-semibold bg-white/85 px-1.5 py-0.5 rounded border border-[#006194]/20 shadow-2xs">
            Karha River Floodway (100y Surge Contour)
          </span>
        </div>
        <div className="absolute left-[780px] top-[140px] pointer-events-none">
          <span className="text-[10px] font-mono uppercase tracking-widest text-amber-800 font-semibold bg-amber-50/90 px-1.5 py-0.5 rounded border border-amber-300 shadow-2xs">
            Microclimate Hotspot: +3.2°C Baseline Deviation
          </span>
        </div>

        {/* ================= CLUSTER & ASSET PINS ================= */}
        {/* Cluster Pin 1: Baramati North */}
        <div 
          onClick={() => setActivePin('baramati-cluster')}
          className="absolute left-[420px] top-[260px] cursor-pointer group"
          title="Baramati Agro-Processing Cluster (34 units)"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#bcc9c6]/50 flex items-center justify-center group-hover:border-[#00685f] transition-all">
              <span className="font-mono text-[13px] font-semibold text-[#0b1c30]">34</span>
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full border-2 border-white"></span>
          </div>
          <span className="mt-1 block text-center font-mono text-[10px] text-[#565e74] bg-white/90 px-1 rounded border border-[#bcc9c6]/40">
            Baramati North
          </span>
        </div>

        {/* Cluster Pin 2: Jejuri MIDC */}
        <div 
          onClick={() => setActivePin('jejuri-cluster')}
          className="absolute left-[340px] top-[470px] cursor-pointer group"
          title="Jejuri MIDC Sector (48 units)"
        >
          <div className="relative flex items-center justify-center">
            <span className="w-10 h-10 rounded-full bg-white shadow-sm border border-[#bcc9c6]/50 flex items-center justify-center group-hover:border-[#00685f] transition-all">
              <span className="font-mono text-[13px] font-semibold text-[#0b1c30]">48</span>
            </span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#00685f] rounded-full border-2 border-white"></span>
          </div>
          <span className="mt-1 block text-center font-mono text-[10px] text-[#565e74] bg-white/90 px-1 rounded border border-[#bcc9c6]/40">
            Jejuri Industrial
          </span>
        </div>

        {/* Single Pin: Resilient Pin (Sahyadri) */}
        <div 
          onClick={() => setActivePin('sahyadri')}
          className="absolute left-[810px] top-[330px] cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 bg-white border border-[#bcc9c6]/50 hover:border-[#00685f] px-2 py-1 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-[12px] font-medium text-[#0b1c30]">Sahyadri Polychem</span>
            <span className="font-mono text-[10px] text-emerald-700 bg-emerald-50 px-1 rounded font-bold">A</span>
          </div>
        </div>

        {/* Single Pin: Moderate Risk (Kisan Cold Storage) */}
        <div 
          onClick={() => setActivePin('kisan')}
          className="absolute left-[590px] top-[240px] cursor-pointer group"
        >
          <div className="flex items-center gap-1.5 bg-white border border-[#bcc9c6]/50 hover:border-[#00685f] px-2 py-1 rounded-lg shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span className="text-[12px] font-medium text-[#0b1c30]">Kisan Cold Storage</span>
            <span className="font-mono text-[10px] text-amber-700 bg-amber-50 px-1 rounded font-bold">C</span>
          </div>
        </div>

        {/* SELECTED BORROWER PIN (PRIMARY FOCUS: Maa Gayatri Agro Cold Chain) */}
        <div 
          onClick={() => {
            setActivePin('maa-gayatri');
            setInspectorOpen(true);
          }}
          className="absolute left-[630px] top-[395px] z-10 cursor-pointer"
        >
          <div className="relative flex items-center justify-center">
            <span className="absolute w-12 h-12 rounded-full bg-rose-500/25 gis-pulse"></span>
            <span className="relative w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-md border-2 border-white">
              <span className="material-symbols-outlined text-[16px]">priority_high</span>
            </span>
          </div>

          {/* Floating Micro-Label */}
          <div className="mt-1 -translate-x-1/2 left-1/2 absolute whitespace-nowrap bg-white border border-rose-400 px-2.5 py-1 rounded shadow-sm text-center">
            <div className="font-mono text-[9px] font-bold text-rose-700 tracking-wider">SELECTED TARGET</div>
            <div className="font-mono text-[12px] text-[#0b1c30] font-semibold">Maa Gayatri Agro</div>
            <div className="font-mono text-[10px] text-rose-700">420m to Karha River | D Band</div>
          </div>
        </div>

        {/* Map Floating Navigation Controls */}
        <div className="absolute right-[430px] bottom-6 z-10 flex flex-col bg-white border border-[#bcc9c6]/40 rounded-lg shadow-sm overflow-hidden">
          <button 
            type="button"
            onClick={() => setZoomLevel(Math.min(zoomLevel + 0.2, 2))}
            className="p-2 text-[#565e74] hover:text-[#0b1c30] hover:bg-[#f2f4f6] transition-colors border-b border-[#bcc9c6]/30" 
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button 
            type="button"
            onClick={() => setZoomLevel(Math.max(zoomLevel - 0.2, 0.8))}
            className="p-2 text-[#565e74] hover:text-[#0b1c30] hover:bg-[#f2f4f6] transition-colors border-b border-[#bcc9c6]/30" 
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button 
            type="button"
            onClick={() => setZoomLevel(1)}
            className="p-2 text-[#565e74] hover:text-[#0b1c30] hover:bg-[#f2f4f6] transition-colors" 
            title="Reset Orientation"
          >
            <span className="material-symbols-outlined text-[18px]">near_me</span>
          </button>
        </div>

        {/* ================= LEFT OVERLAY: SPATIAL QUERY FILTER DRAWER ================= */}
        {filterDrawerOpen ? (
          <aside className="absolute left-4 top-4 bottom-4 w-72 bg-white border border-[#bcc9c6]/40 rounded-xl shadow-md z-20 flex flex-col overflow-hidden animate-in slide-in-from-left duration-150">
            {/* Header */}
            <div className="p-3 border-b border-[#bcc9c6]/30 flex items-center justify-between bg-[#f8f9ff]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#00685f]">filter_list</span>
                <span className="text-[12px] font-semibold text-[#0b1c30] uppercase tracking-wide">Spatial Query Filter</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  type="button" 
                  onClick={handleResetFilter}
                  className="font-mono text-[11px] text-[#00685f] hover:underline"
                >
                  Reset
                </button>
                <button
                  type="button"
                  onClick={() => setFilterDrawerOpen(false)}
                  className="text-[#6d7a77] hover:text-[#0b1c30]"
                >
                  <span className="material-symbols-outlined text-[16px]">chevron_left</span>
                </button>
              </div>
            </div>

            {/* Filter Content */}
            <div className="flex-1 p-3.5 space-y-4 overflow-y-auto custom-scroll text-[12px]">
              {/* Geography */}
              <div>
                <label className="block font-mono text-[10px] text-[#565e74] uppercase tracking-wider mb-1">State & District</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full h-8 text-[12px] rounded-lg border border-[#bcc9c6]/50 bg-white px-2 text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                >
                  <option>Maharashtra — Pune & Satara</option>
                  <option>Gujarat — Surat & Bharuch</option>
                  <option>Odisha — Jagatsinghpur</option>
                  <option>Tamil Nadu — Chennai & Tiruvallur</option>
                </select>
              </div>

              {/* Loan Size Range Slider */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-mono text-[10px] text-[#565e74] uppercase tracking-wider">Facility Loan Size</label>
                  <span className="font-mono text-[11px] text-[#0b1c30] font-semibold">₹50L – ₹15 Cr</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="5000"
                  value={loanSizeRange}
                  onChange={(e) => setLoanSizeRange(Number(e.target.value))}
                  className="w-full accent-[#00685f] h-1.5 bg-[#eceef0] rounded cursor-pointer"
                />
                <div className="flex justify-between font-mono text-[10px] text-[#565e74] mt-1">
                  <span>₹10 Lakh</span>
                  <span>₹50 Crore</span>
                </div>
              </div>

              {/* Industry Sector */}
              <div>
                <label className="block font-mono text-[10px] text-[#565e74] uppercase tracking-wider mb-1.5">Industry Sector</label>
                <div className="space-y-1.5 text-[12px]">
                  <label className="flex items-center gap-2 text-[#0b1c30] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sectors.agro}
                      onChange={(e) => setSectors({ ...sectors, agro: e.target.checked })}
                      className="rounded text-[#00685f] focus:ring-0"
                    />
                    <span>Agro & Cold Storage (68)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#0b1c30] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sectors.textiles}
                      onChange={(e) => setSectors({ ...sectors, textiles: e.target.checked })}
                      className="rounded text-[#00685f] focus:ring-0"
                    />
                    <span>Textiles & Dying (32)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#0b1c30] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sectors.chemicals}
                      onChange={(e) => setSectors({ ...sectors, chemicals: e.target.checked })}
                      className="rounded text-[#00685f] focus:ring-0"
                    />
                    <span>Chemicals & Plastics (24)</span>
                  </label>
                  <label className="flex items-center gap-2 text-[#565e74] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={sectors.auto}
                      onChange={(e) => setSectors({ ...sectors, auto: e.target.checked })}
                      className="rounded text-[#00685f] focus:ring-0"
                    />
                    <span>Auto Ancillary (18)</span>
                  </label>
                </div>
              </div>

              {/* Climate Risk Band (A - E) */}
              <div>
                <label className="block font-mono text-[10px] text-[#565e74] uppercase tracking-wider mb-1.5">Climate Risk Band</label>
                <div className="grid grid-cols-5 gap-1 text-center">
                  {(['A', 'B', 'C', 'D', 'E'] as RiskGrade[]).map((band) => {
                    const isSelected = selectedRiskBand === band;
                    return (
                      <button
                        key={band}
                        type="button"
                        onClick={() => setSelectedRiskBand(band)}
                        className={`py-1 rounded font-mono text-[11px] font-bold transition-all ${
                          isSelected
                            ? 'border-2 border-rose-600 bg-rose-100 text-rose-800 shadow-xs'
                            : 'border border-[#bcc9c6]/40 bg-[#f8f9ff] text-[#565e74] hover:bg-white'
                        }`}
                      >
                        {band}
                      </button>
                    );
                  })}
                </div>
                <span className="block text-[10px] text-[#565e74] mt-1 text-center font-mono">
                  Band {selectedRiskBand} selected: High Inundation Hazard
                </span>
              </div>

              {/* Waterbody Proximity */}
              <div className="pt-2 border-t border-[#bcc9c6]/20">
                <label className="block font-mono text-[10px] text-[#565e74] uppercase tracking-wider mb-1">Waterbody Proximity</label>
                <select
                  value={waterProximity}
                  onChange={(e) => setWaterProximity(e.target.value)}
                  className="w-full h-8 text-[12px] rounded-lg border border-[#bcc9c6]/50 bg-white px-2 text-[#0b1c30] focus:outline-none focus:ring-1 focus:ring-[#00685f]"
                >
                  <option>&lt; 500m to Major River/Basin</option>
                  <option>&lt; 1000m to Waterbody</option>
                  <option>Within 100y Coastal Surge Zone</option>
                  <option>All Topographic Zones</option>
                </select>
              </div>
            </div>

            {/* Match summary */}
            <div className="p-2.5 bg-[#f8f9ff] border-t border-[#bcc9c6]/30 flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#565e74]">Filtered Match:</span>
              <span className="font-mono font-semibold text-[#00685f]">29 Facilities (20.4%)</span>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setFilterDrawerOpen(true)}
            className="absolute left-4 top-4 z-20 h-9 px-3 rounded-lg bg-white border border-[#bcc9c6]/40 shadow-sm flex items-center gap-1.5 text-[12px] font-medium text-[#0b1c30] hover:bg-[#f2f4f6]"
          >
            <span className="material-symbols-outlined text-[16px]">filter_list</span>
            <span>Show Filters</span>
          </button>
        )}

        {/* ================= RIGHT SLIDE-OUT: SELECTED BORROWER INSPECTION DRAWER ================= */}
        {inspectorOpen ? (
          <aside className="absolute right-4 top-4 bottom-4 w-96 bg-white border border-[#bcc9c6]/40 rounded-xl shadow-lg z-20 flex flex-col overflow-hidden animate-in slide-in-from-right duration-150">
            {/* Drawer Header */}
            <div className="p-3.5 border-b border-[#bcc9c6]/30 bg-[#f8f9ff] flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-rose-800 bg-rose-100 px-1.5 py-0.2 rounded font-semibold border border-rose-200">
                    Risk Band {PRIMARY_BORROWER.riskBand}
                  </span>
                  <span className="font-mono text-[10px] text-[#565e74]">GSTIN: {PRIMARY_BORROWER.gstin}</span>
                </div>
                <h2 className="text-[15px] font-semibold text-[#0b1c30] tracking-tight leading-snug">
                  {PRIMARY_BORROWER.name}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                className="p-1 text-[#565e74] hover:text-[#0b1c30] rounded hover:bg-[#eceef0] transition-colors"
                title="Close Inspector"
              >
                <span className="material-symbols-outlined text-[18px]">close</span>
              </button>
            </div>

            {/* Drawer Body */}
            <div className="flex-1 p-4 space-y-4 overflow-y-auto custom-scroll text-[12px]">
              {/* Satellite Optical Surface (Sentinel-2 L2A) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#565e74] uppercase">
                    Satellite Optical Surface (Sentinel-2 L2A)
                  </span>
                  <span className="font-mono text-[10px] text-[#006194] font-medium">10m Resolution</span>
                </div>

                <div className="relative h-36 w-full rounded-lg overflow-hidden border border-[#bcc9c6]/40 bg-[#eceef0]">
                  <img
                    src={PRIMARY_BORROWER.satelliteImage}
                    alt="Satellite view of Maa Gayatri Agro Cold Chain near Karha riverbank"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#0b1c30] border border-[#bcc9c6]/40">
                    18°18'22"N 74°34'11"E
                  </div>
                  <div className="absolute top-1.5 right-2 bg-rose-600 text-white px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shadow-xs">
                    Buffer Breach
                  </div>
                </div>
              </div>

              {/* Micro-Actuarial Metric Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* River Proximity Buffer */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">River Buffer Distance</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-rose-700">{PRIMARY_BORROWER.riverBufferDistanceM}m</span>
                    <span className="font-mono text-[10px] text-[#565e74]">to Karha River</span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-medium block mt-0.5">&lt; 500m Fluvial Hazard Zone</span>
                </div>

                {/* Micro-Elevation */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">Micro-Elevation (DEM)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-[#0b1c30]">{PRIMARY_BORROWER.elevationMsl} m</span>
                    <span className="font-mono text-[10px] text-[#565e74]">MSL</span>
                  </div>
                  <span className="text-[10px] text-[#565e74] font-medium block mt-0.5">-2.8m below 100y floodline</span>
                </div>

                {/* Debt Exposure */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">Debt Outstanding</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-[#0b1c30]">₹7.45 Cr</span>
                  </div>
                  <span className="text-[10px] text-[#565e74] font-medium block mt-0.5">Term Loan (SME-Agridiv)</span>
                </div>

                {/* Modeled Loss Given Surge */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">Modeled Loss Given Surge</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-rose-700">41.8%</span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-medium block mt-0.5">+184 bps spread required</span>
                </div>
              </div>

              {/* Physical Hazard Stress Test Breakdown */}
              <div className="border border-[#bcc9c6]/30 rounded-lg p-3 bg-white space-y-2">
                <span className="font-mono text-[10px] text-[#565e74] uppercase block font-semibold">Actuarial Stress Simulation</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#565e74] font-mono text-[11px]">Inundation Depth (T+48h)</span>
                    <span className="font-mono text-[12px] text-rose-700 font-semibold">1.45 meters</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-600 h-full rounded-full w-3/4"></div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[#565e74] font-mono text-[11px]">Supply Chain Road Inaccessibility</span>
                    <span className="font-mono text-[12px] text-amber-700 font-semibold">4.5 Days</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full rounded-full w-1/2"></div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="text-[#565e74] font-mono">Structural Defense Bund</span>
                    <span className="font-mono text-[#565e74] font-medium">None / Unprotected</span>
                  </div>
                </div>
              </div>

              {/* Policy Recommendation */}
              <div className="p-3 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff] space-y-1">
                <div className="flex items-center gap-1.5 text-[#006194]">
                  <span className="material-symbols-outlined text-[16px]">policy</span>
                  <span className="font-mono text-[10px] font-semibold uppercase">Underwriter Policy Recommendation</span>
                </div>
                <p className="text-[12px] text-[#0b1c30] leading-relaxed">
                  Require borrower to install 1.8m perimeter flood deflectors or mandate secondary parametric flood insurance rider before FY26 credit renewal.
                </p>
              </div>
            </div>

            {/* 1-Click Action Footer */}
            <div className="p-3.5 bg-[#f8f9ff] border-t border-[#bcc9c6]/30 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenUnderwritingFile(PRIMARY_BORROWER)}
                className="w-full h-9 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-medium text-[12px] flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-[16px]">launch</span>
                <span>Open Full Underwriting File</span>
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsWatchlisted(!isWatchlisted)}
                  className={`flex-1 h-8 rounded-lg border text-[12px] font-medium flex items-center justify-center gap-1.5 transition-colors ${
                    isWatchlisted
                      ? 'bg-amber-50 border-amber-300 text-amber-800'
                      : 'border-[#bcc9c6]/40 bg-white hover:bg-[#f2f4f6] text-[#0b1c30]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isWatchlisted ? 'bookmark_added' : 'bookmark_add'}
                  </span>
                  <span>{isWatchlisted ? 'In Watchlist' : 'Watchlist'}</span>
                </button>

                <button
                  type="button"
                  onClick={onExportDossier}
                  className="flex-1 h-8 rounded-lg border border-[#bcc9c6]/40 bg-white hover:bg-[#f2f4f6] text-[12px] font-medium text-[#0b1c30] flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">share</span>
                  <span>Export Dossier</span>
                </button>
              </div>
            </div>
          </aside>
        ) : (
          <button
            type="button"
            onClick={() => setInspectorOpen(true)}
            className="absolute right-4 top-4 z-20 h-9 px-3.5 rounded-lg bg-white border border-[#bcc9c6]/40 shadow-sm flex items-center gap-1.5 text-[12px] font-medium text-[#0b1c30] hover:bg-[#f2f4f6]"
          >
            <span className="material-symbols-outlined text-[16px]">info</span>
            <span>Inspect Selected Borrower</span>
          </button>
        )}
      </div>
    </div>
  );
}
