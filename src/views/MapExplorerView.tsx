import React, { useCallback, useEffect, useRef, useState } from 'react';
import { HazardType, RiskGrade, BorrowerRecord } from '../types';
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

const HAZARD_STYLE: Record<
  'flood' | 'heat' | 'drought' | 'storm',
  { stroke: string; fill: string; radius: (b: BorrowerRecord) => number }
> = {
  flood: { stroke: '#006194', fill: '#007bb9', radius: (b) => 1800 + b.floodDepthModeledM * 2200 },
  heat: { stroke: '#f59e0b', fill: '#f59e0b', radius: () => 3500 },
  drought: { stroke: '#ea580c', fill: '#ea580c', radius: () => 6500 },
  storm: { stroke: '#0d9488', fill: '#14b8a6', radius: () => 5200 },
};

interface MapExplorerViewProps {
  onOpenUnderwritingFile: (borrower: BorrowerRecord) => void;
  onExportDossier: () => void;
}

function ExplorerGoogleMap({
  satelliteMode,
  selectedHazard,
  selectedBorrowerId,
  onSelect,
}: {
  satelliteMode: 'satellite' | 'terrain';
  selectedHazard: HazardType;
  selectedBorrowerId: string;
  onSelect: (b: BorrowerRecord) => void;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<Map<string, google.maps.Marker>>(new Map());
  const circlesRef = useRef<google.maps.Circle[]>([]);

  useEffect(() => {
    let cancelled = false;
    loadGoogleMaps().then(() => {
      if (cancelled || !containerRef.current) return;
      const map = new google.maps.Map(containerRef.current, {
        center: { lat: 20.5, lng: 78.9 },
        zoom: 5,
        mapTypeControl: true,
        mapTypeControlOptions: { mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain'] },
        streetViewControl: false,
        fullscreenControl: false,
      });
      mapRef.current = map;
      const bounds = new google.maps.LatLngBounds();
      ALL.forEach((b) => {
        const marker = new google.maps.Marker({
          position: { lat: b.coordinates.lat, lng: b.coordinates.lng },
          map,
          icon: bandPinSymbol(BAND_COLORS[b.riskBand], b.id === selectedBorrowerId),
          label: { text: b.riskBand, color: '#ffffff', fontSize: '11px', fontWeight: '700' },
          title: `${b.name} — score ${b.climateAdjustedScore}, Band ${b.riskBand}`,
        });
        marker.addListener('click', () => onSelect(b));
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
    if (!ready || !mapRef.current) return;
    mapRef.current.setMapTypeId(
      satelliteMode === 'satellite' ? google.maps.MapTypeId.HYBRID : google.maps.MapTypeId.TERRAIN
    );
  }, [ready, satelliteMode]);

  useEffect(() => {
    if (!ready) return;
    markersRef.current.forEach((marker, id) => {
      const b = ALL.find((x) => x.id === id);
      if (b) marker.setIcon(bandPinSymbol(BAND_COLORS[b.riskBand], id === selectedBorrowerId));
    });
  }, [ready, selectedBorrowerId]);

  useEffect(() => {
    if (!ready || !mapRef.current) return;
    circlesRef.current.forEach((c) => c.setMap(null));
    circlesRef.current = [];
    const key = selectedHazard === 'satellite' ? 'flood' : selectedHazard;
    const style = HAZARD_STYLE[key];
    ALL.forEach((b) => {
      const circle = new google.maps.Circle({
        map: mapRef.current,
        center: { lat: b.coordinates.lat, lng: b.coordinates.lng },
        radius: style.radius(b),
        strokeColor: style.stroke,
        strokeOpacity: 0.75,
        strokeWeight: 1.5,
        fillColor: style.fill,
        fillOpacity: 0.18,
        clickable: false,
      });
      circlesRef.current.push(circle);
    });
  }, [ready, selectedHazard]);

  return <div ref={containerRef} className="absolute inset-0 h-full w-full" />;
}

export function MapExplorerView({ onOpenUnderwritingFile, onExportDossier }: MapExplorerViewProps) {
  const [selectedHazard, setSelectedHazard] = useState<HazardType>('flood');
  const [satelliteMode, setSatelliteMode] = useState<'satellite' | 'terrain'>('satellite');
  const [isPlayingScrubber, setIsPlayingScrubber] = useState<boolean>(false);

  // Filter drawer states
  const [selectedState, setSelectedState] = useState('Maharashtra — Pune & Satara');
  const [loanSizeRange, setLoanSizeRange] = useState<number>(1500);
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
  const [selectedBorrower, setSelectedBorrower] = useState<BorrowerRecord>(PRIMARY_BORROWER);

  const handleSelectBorrower = useCallback((b: BorrowerRecord) => {
    setSelectedBorrower(b);
    setInspectorOpen(true);
  }, []);

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

  const b = selectedBorrower;
  const totalExposure = ALL.reduce((s, x) => s + x.facilityAmountCr, 0);
  const highHazardCount = ALL.filter((x) => x.riskBand === 'D' || x.riskBand === 'E').length;
  const highHazardExposure = ALL.filter((x) => x.riskBand === 'D' || x.riskBand === 'E').reduce(
    (s, x) => s + x.revenueAtRiskCr,
    0
  );
  const modeledLgd = (28 + b.floodDepthModeledM * 9.5).toFixed(1);
  const coordLabel = `${b.coordinates.lat.toFixed(2)}°N ${b.coordinates.lng.toFixed(2)}°E`;

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
            <span className="text-[#565e74] font-mono text-[11px]">VIEWPORT:</span>
            <span className="font-mono text-[12px] font-medium text-[#0b1c30]">
              All-India portfolio — {ALL.length} tracked MSMEs
            </span>
          </div>
          <div className="h-3 w-px bg-[#bcc9c6]/40"></div>
          <div className="flex items-center gap-1.5">
            <span className="text-[#565e74] font-mono text-[11px]">PORTFOLIO EXPOSURE:</span>
            <span className="font-mono text-[11px] bg-white border border-[#bcc9c6]/40 px-1.5 py-0.2 rounded font-medium text-[#0b1c30]">
              {ALL.length} MSMEs
            </span>
            <span className="text-[#565e74]">|</span>
            <span className="font-mono text-[12px] font-semibold text-[#0b1c30]">₹{totalExposure.toFixed(1)} Cr</span>
            <span className="text-[#565e74] font-mono text-[11px]">Debt Outstanding</span>
          </div>
          <div className="h-3 w-px bg-[#bcc9c6]/40"></div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-[11px] text-rose-800 bg-rose-100 border border-rose-300 px-1.5 py-0.2 rounded font-semibold">
              HIGH HAZARD: {highHazardCount} Borrowers
            </span>
            <span className="font-mono text-[12px] text-rose-700 font-semibold">
              (₹{highHazardExposure.toFixed(1)} Cr At Risk)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-[#565e74] flex items-center gap-1">
            <span className="material-symbols-outlined text-[14px]">cloud_sync</span>
            IMD HydroNet Sync: 4m ago
          </span>
        </div>
      </div>

      {/* ================= WORKBENCH BODY: GOOGLE MAP + DRAWERS ================= */}
      <div className="flex-1 relative overflow-hidden bg-[#eef3f1]">
        <ExplorerGoogleMap
          satelliteMode={satelliteMode}
          selectedHazard={selectedHazard}
          selectedBorrowerId={b.id}
          onSelect={handleSelectBorrower}
        />

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
                            ? 'border-2 text-white shadow-xs'
                            : 'border border-[#bcc9c6]/40 bg-[#f8f9ff] text-[#565e74] hover:bg-white'
                        }`}
                        style={isSelected ? { background: BAND_COLORS[band], borderColor: BAND_COLORS[band] } : undefined}
                      >
                        {band}
                      </button>
                    );
                  })}
                </div>
                <span className="block text-[10px] text-[#565e74] mt-1 text-center font-mono">
                  Band {selectedRiskBand} filter active on hazard layers
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
                  <option>{'<'} 500m to Major River/Basin</option>
                  <option>{'<'} 1000m to Waterbody</option>
                  <option>Within 100y Coastal Surge Zone</option>
                  <option>All Topographic Zones</option>
                </select>
              </div>
            </div>

            {/* Match summary */}
            <div className="p-2.5 bg-[#f8f9ff] border-t border-[#bcc9c6]/30 flex items-center justify-between text-[11px]">
              <span className="font-mono text-[#565e74]">Filtered Match:</span>
              <span className="font-mono font-semibold text-[#00685f]">
                {ALL.filter((x) => x.riskBand === selectedRiskBand).length} of {ALL.length} tracked facilities
              </span>
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
                  <span
                    className="font-mono text-[10px] uppercase tracking-wider text-white px-1.5 py-0.2 rounded font-semibold"
                    style={{ background: BAND_COLORS[b.riskBand] }}
                  >
                    Risk Band {b.riskBand} • {b.riskCategory}
                  </span>
                  <span className="font-mono text-[10px] text-[#565e74]">GSTIN: {b.gstin}</span>
                </div>
                <h2 className="text-[15px] font-semibold text-[#0b1c30] tracking-tight leading-snug">
                  {b.name}
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
                    src={b.satelliteImage}
                    alt={`Satellite view of ${b.name} site`}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-1.5 left-2 bg-white/90 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#0b1c30] border border-[#bcc9c6]/40">
                    {coordLabel}
                  </div>
                  {b.riverBufferDistanceM < 500 && (
                    <div className="absolute top-1.5 right-2 bg-rose-600 text-white px-1.5 py-0.5 rounded font-mono text-[10px] font-bold shadow-xs">
                      Buffer Breach
                    </div>
                  )}
                </div>
              </div>

              {/* Micro-Actuarial Metric Grid */}
              <div className="grid grid-cols-2 gap-2">
                {/* River Proximity Buffer */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">River Buffer Distance</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className={`font-mono text-[18px] font-bold ${b.riverBufferDistanceM < 500 ? 'text-rose-700' : 'text-[#0b1c30]'}`}>
                      {b.riverBufferDistanceM}m
                    </span>
                  </div>
                  <span className="text-[10px] text-[#565e74] font-medium block mt-0.5">to {b.waterbodyName}</span>
                </div>

                {/* Micro-Elevation */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">Micro-Elevation (DEM)</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-[#0b1c30]">{b.elevationMsl} m</span>
                    <span className="font-mono text-[10px] text-[#565e74]">MSL</span>
                  </div>
                  <span className="text-[10px] text-[#565e74] font-medium block mt-0.5">vs 100y floodline</span>
                </div>

                {/* Debt Exposure */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">Debt Outstanding</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-[#0b1c30]">₹{b.facilityAmountCr.toFixed(2)} Cr</span>
                  </div>
                  <span className="text-[10px] text-[#565e74] font-medium block mt-0.5">
                    {b.facilityType} · {b.tenorMonths}mo tenor
                  </span>
                </div>

                {/* Modeled Loss Given Surge */}
                <div className="p-2.5 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
                  <span className="block font-mono text-[10px] text-[#565e74] uppercase">Modeled Loss Given Surge</span>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="font-mono text-[18px] font-bold text-rose-700">{modeledLgd}%</span>
                  </div>
                  <span className="text-[10px] text-rose-700 font-medium block mt-0.5">
                    +{b.recommendedSpreadAdjustmentBps} bps spread required
                  </span>
                </div>
              </div>

              {/* Physical Hazard Stress Test Breakdown */}
              <div className="border border-[#bcc9c6]/30 rounded-lg p-3 bg-white space-y-2">
                <span className="font-mono text-[10px] text-[#565e74] uppercase block font-semibold">Actuarial Stress Simulation</span>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-[#565e74] font-mono text-[11px]">Inundation Depth (T+48h)</span>
                    <span className="font-mono text-[12px] text-rose-700 font-semibold">{b.floodDepthModeledM} meters</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-rose-600 h-full rounded-full"
                      style={{ width: `${Math.min(100, (b.floodDepthModeledM / 2) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[#565e74] font-mono text-[11px]">Supply Chain Road Inaccessibility</span>
                    <span className="font-mono text-[12px] text-amber-700 font-semibold">{b.supplyRouteDowntimeDays} Days</span>
                  </div>
                  <div className="w-full bg-[#eceef0] h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-amber-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (b.supplyRouteDowntimeDays / 10) * 100)}%` }}
                    ></div>
                  </div>

                  <div className="flex justify-between items-center pt-1 text-[11px]">
                    <span className="text-[#565e74] font-mono">Climate Score Impact</span>
                    <span className="font-mono text-rose-700 font-medium">
                      {b.baseCreditScore} → {b.climateAdjustedScore} (−{b.climateDragPoints} pts)
                    </span>
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
                  {b.recommendedCovenants[0] ||
                    'Require perimeter flood defences or parametric flood insurance before the next credit renewal cycle.'}
                </p>
              </div>
            </div>

            {/* 1-Click Action Footer */}
            <div className="p-3.5 bg-[#f8f9ff] border-t border-[#bcc9c6]/30 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => onOpenUnderwritingFile(b)}
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
