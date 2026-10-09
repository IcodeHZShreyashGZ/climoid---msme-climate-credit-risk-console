import React, { useState } from 'react';
import { BorrowerRecord, TimeHorizon } from '../types';
import { PRIMARY_BORROWER } from '../data/mockData';

interface BorrowerConsoleViewProps {
  borrower?: BorrowerRecord;
  horizon: TimeHorizon;
  onExportCreditNote: () => void;
  onNavigateToMap: () => void;
}

export function BorrowerConsoleView({
  borrower = PRIMARY_BORROWER,
  horizon,
  onExportCreditNote,
  onNavigateToMap
}: BorrowerConsoleViewProps) {
  const [reassessing, setReassessing] = useState(false);
  const [reassessFeedback, setReassessFeedback] = useState<string | null>(null);
  const [covenantApproved, setCovenantApproved] = useState(false);
  const [rmAuditRequested, setRmAuditRequested] = useState(false);
  const [overridden, setOverridden] = useState(false);

  const handleReassessLocation = () => {
    setReassessing(true);
    setReassessFeedback(null);
    setTimeout(() => {
      setReassessing(false);
      setReassessFeedback('Hydrological basin geometry recalibrated: 420m to Karha River verified via Sentinel-2 SAR pass.');
      setTimeout(() => setReassessFeedback(null), 4000);
    }, 1200);
  };

  const handleApprove = () => {
    setCovenantApproved(true);
    setOverridden(false);
  };

  const handleOverride = () => {
    setOverridden(true);
    setCovenantApproved(false);
  };

  const handleRmAudit = () => {
    setRmAuditRequested(true);
    setTimeout(() => setRmAuditRequested(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5 max-w-[1600px] mx-auto select-none">
      {/* Toast feedback banner if active */}
      {reassessFeedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">satellite_alt</span>
            <span className="font-medium">{reassessFeedback}</span>
          </div>
          <button onClick={() => setReassessFeedback(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {rmAuditRequested && (
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-[13px] text-blue-900 flex items-center gap-2 shadow-xs animate-in fade-in duration-200">
          <span className="material-symbols-outlined text-blue-700 text-[18px]">assignment_turned_in</span>
          <span>RM Site Audit task created and dispatched to Baramati Agri-Cluster branch manager. SLA: 48 hours.</span>
        </div>
      )}

      {/* Top Borrower Profile Header */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight">{borrower.name}</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#f2f4f6] text-[#3d4947] border border-[#bcc9c6]/40">
                MSME ID: {borrower.msmeId}
              </span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Risk Category: {borrower.riskCategory}
              </span>
            </div>

            <div className="flex items-center gap-x-3 gap-y-1 flex-wrap text-[13px] text-[#3d4947]">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#6d7a77]">category</span>
                {borrower.sector}
              </span>
              <span className="text-[#bcc9c6]">•</span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#6d7a77]">location_on</span>
                {borrower.location}
              </span>
              <span className="text-[#bcc9c6]">•</span>
              <span className="font-mono text-[11px] text-[#6d7a77]">
                GSTIN: {borrower.gstin}
              </span>
            </div>
          </div>

          {/* Facility Metadata & Action Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex items-center gap-4 bg-[#f2f4f6] px-3.5 py-1.5 rounded-lg border border-[#bcc9c6]/30">
              <div>
                <div className="font-mono uppercase text-[10px] text-[#6d7a77] leading-tight">Requested Facility</div>
                <div className="font-mono text-[16px] font-semibold text-[#0b1c30] leading-snug">
                  ₹{borrower.facilityAmountCr.toFixed(2)} Cr <span className="text-[12px] font-normal text-[#565e74]">{borrower.facilityType}</span>
                </div>
              </div>
              <div className="w-px h-6 bg-[#bcc9c6]/40"></div>
              <div>
                <div className="font-mono uppercase text-[10px] text-[#6d7a77] leading-tight">Tenor</div>
                <div className="font-mono text-[16px] font-semibold text-[#0b1c30] leading-snug">
                  {borrower.tenorMonths} Mo
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={handleReassessLocation}
              disabled={reassessing}
              className="h-9 px-3 bg-white border border-[#bcc9c6]/40 hover:bg-[#f2f4f6] text-[#0b1c30] text-[12px] font-medium rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[16px] ${reassessing ? 'animate-spin' : ''}`}>sync</span>
              <span>{reassessing ? 'Recalibrating...' : 'Re-assess Location'}</span>
            </button>

            <button
              type="button"
              onClick={onExportCreditNote}
              className="h-9 px-3.5 bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-xs active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px]">description</span>
              <span>Export Credit Note</span>
            </button>
          </div>
        </div>
      </section>

      {/* Core Underwriting Scorecard: 4 Comparative Cards */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Base Financial Score */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono uppercase text-[11px] text-[#6d7a77]">Base Financial Credit Score</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                Grade: A-
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-[32px] font-semibold text-[#0b1c30] tracking-tight">
                {borrower.baseCreditScore}
              </span>
              <span className="font-mono text-[15px] text-[#6d7a77]">/ 900</span>
            </div>
            <div className="text-[12px] text-[#565e74] leading-relaxed">
              Low Default Risk tier based on 3-yr audited financials & debt service.
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between text-[12px]">
            <span className="text-[#6d7a77]">Base Probability of Default:</span>
            <span className="font-mono font-semibold text-[#0b1c30]">{borrower.basePdPercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Card 2: Climate-Adjusted Score */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs relative overflow-hidden">
          <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-bl-full pointer-events-none"></div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono uppercase text-[11px] text-[#00685f] font-semibold">Climate-Adjusted Score</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                Grade: B
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-[32px] font-semibold text-[#0b1c30] tracking-tight">
                {borrower.climateAdjustedScore}
              </span>
              <span className="font-mono text-[15px] text-[#6d7a77]">/ 900</span>
            </div>
            <div className="text-[12px] text-[#565e74] leading-relaxed">
              Compound physical stress deduction applied to borrower balance sheet.
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between text-[12px]">
            <span className="text-[#6d7a77]">Adjusted Probability of Default:</span>
            <span className="font-mono font-semibold text-amber-700">{borrower.adjustedPdPercent.toFixed(2)}%</span>
          </div>
        </div>

        {/* Card 3: Climate Drag Delta */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono uppercase text-[11px] text-[#6d7a77]">Climate Drag Delta</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                -{borrower.climateDragPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="font-mono text-[32px] font-semibold text-rose-700 tracking-tight">
                -{borrower.climateDragPoints}
              </span>
              <span className="font-mono text-[16px] text-rose-700 font-medium">pts</span>
            </div>
            <div className="text-[12px] text-[#565e74] leading-relaxed">
              Localized flood plain inundation risk and extreme refrigeration heat strain.
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between text-[12px]">
            <span className="text-[#6d7a77]">PD Spread Adjustment:</span>
            <span className="font-mono font-semibold text-rose-700">+1.57%</span>
          </div>
        </div>

        {/* Card 4: Revenue-at-Risk Snapshot */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="font-mono uppercase text-[11px] text-[#6d7a77]">Revenue-at-Risk (7-Day Peak)</span>
              <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                {borrower.revenueAtRiskPercent}%
              </span>
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-mono text-[32px] font-semibold text-[#0b1c30] tracking-tight">
                ₹{borrower.revenueAtRiskCr.toFixed(2)} Cr
              </span>
            </div>
            <div className="text-[12px] text-[#565e74] leading-relaxed">
              Direct inventory spoil and transit stoppage during monsoon surge peak.
            </div>
          </div>
          <div className="pt-3 mt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between text-[12px]">
            <span className="text-[#6d7a77]">Annual Turnover Exposure:</span>
            <span className="font-mono font-semibold text-[#0b1c30]">₹{borrower.annualTurnoverCr.toFixed(2)} Cr base</span>
          </div>
        </div>
      </section>

      {/* Hazard Exposure Grid: 4 minimalist analytical cards */}
      <section className="flex flex-col gap-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-[16px] font-semibold text-[#0b1c30]">Physical Hazard Exposure Matrix</h2>
          <span className="font-mono text-[11px] text-[#6d7a77]">Resolution: 30m Micro-Basin Grid</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Flood Card */}
          <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-rose-600">flood</span>
                  <span className="text-[13px] font-semibold text-[#0b1c30]">Riverine Flood</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-rose-50 text-rose-700 border border-rose-200 font-semibold">
                  High (P = 68%)
                </span>
              </div>

              {/* Sparkline SVG */}
              <div className="h-8 w-full flex items-end pt-1">
                <svg className="w-full h-7 overflow-visible" fill="none" viewBox="0 0 120 30">
                  <path d="M0 25 L20 22 L40 24 L60 16 L80 18 L100 8 L120 4" stroke="#e11d48" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="120" cy="4" r="3" fill="#e11d48" />
                </svg>
              </div>

              <div className="text-[12px] text-[#565e74] mt-0.5">
                <span className="font-medium text-rose-700">7-Day Alert:</span> Imminent riverine surge alert on Karha river basin.
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#bcc9c6]/20 font-mono text-[11px] text-[#6d7a77] flex justify-between">
              <span>2050 Climate Outlook</span>
              <span className="text-[#0b1c30] font-medium">+24% Frequency</span>
            </div>
          </div>

          {/* Extreme Heat Card */}
          <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">thermostat</span>
                  <span className="text-[13px] font-semibold text-[#0b1c30]">Extreme Heat</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                  Moderate (P = 42%)
                </span>
              </div>

              <div className="h-8 w-full flex items-end pt-1">
                <svg className="w-full h-7 overflow-visible" fill="none" viewBox="0 0 120 30">
                  <path d="M0 20 L20 18 L40 19 L60 14 L80 12 L100 13 L120 9" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="120" cy="9" r="3" fill="#d97706" />
                </svg>
              </div>

              <div className="text-[12px] text-[#565e74] mt-0.5">
                <span className="font-medium text-amber-700">7-Day Alert:</span> +3.8°C above seasonal baseline, compressor stress.
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#bcc9c6]/20 font-mono text-[11px] text-[#6d7a77] flex justify-between">
              <span>2050 Climate Outlook</span>
              <span className="text-[#0b1c30] font-medium">+18 Days &gt;42°C</span>
            </div>
          </div>

          {/* Drought Card */}
          <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600">water_drop</span>
                  <span className="text-[13px] font-semibold text-[#0b1c30]">Drought & Water</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                  Low (P = 14%)
                </span>
              </div>

              <div className="h-8 w-full flex items-end pt-1">
                <svg className="w-full h-7 overflow-visible" fill="none" viewBox="0 0 120 30">
                  <path d="M0 12 L20 14 L40 13 L60 17 L80 15 L100 18 L120 16" stroke="#059669" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="120" cy="16" r="3" fill="#059669" />
                </svg>
              </div>

              <div className="text-[12px] text-[#565e74] mt-0.5">
                <span className="font-medium text-emerald-800">7-Day Alert:</span> Water table stability index optimal (72/100).
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#bcc9c6]/20 font-mono text-[11px] text-[#6d7a77] flex justify-between">
              <span>2050 Climate Outlook</span>
              <span className="text-[#0b1c30] font-medium">-4% Aquifer Level</span>
            </div>
          </div>

          {/* Severe Storm Card */}
          <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px] text-amber-600">cyclone</span>
                  <span className="text-[13px] font-semibold text-[#0b1c30]">Severe Storm</span>
                </div>
                <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 font-semibold">
                  Moderate (P = 31%)
                </span>
              </div>

              <div className="h-8 w-full flex items-end pt-1">
                <svg className="w-full h-7 overflow-visible" fill="none" viewBox="0 0 120 30">
                  <path d="M0 24 L20 22 L40 18 L60 19 L80 11 L100 14 L120 13" stroke="#d97706" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="120" cy="13" r="3" fill="#d97706" />
                </svg>
              </div>

              <div className="text-[12px] text-[#565e74] mt-0.5">
                <span className="font-medium text-amber-700">7-Day Alert:</span> Wind gust threshold warning in 72h (&gt;55 km/h).
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-[#bcc9c6]/20 font-mono text-[11px] text-[#6d7a77] flex justify-between">
              <span>2050 Climate Outlook</span>
              <span className="text-[#0b1c30] font-medium">+11% Cyclone Frequency</span>
            </div>
          </div>
        </div>
      </section>

      {/* Climate Drag Attribution Analysis */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 flex flex-col gap-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0b1c30]">Climate Drag Attribution Analysis</h2>
            <p className="text-[12px] text-[#565e74]">
              Breakdown of {borrower.climateDragPoints}-point underwriting haircut applied to {borrower.name}
            </p>
          </div>
          <div className="font-mono text-[11px] text-[#6d7a77]">Model Version: ECMWF v4.8-MH</div>
        </div>

        {/* Segmented Multi-Bar */}
        <div className="flex flex-col gap-2">
          <div className="w-full h-2.5 rounded-full bg-[#eceef0] flex overflow-hidden">
            <div className="bg-rose-500 h-full" style={{ width: '38%' }} title="Flood Plain Proximity: 38%"></div>
            <div className="bg-amber-500 h-full" style={{ width: '22%' }} title="Cold Chain Energy Fragility: 22%"></div>
            <div className="bg-rose-400 h-full" style={{ width: '18%' }} title="Supply Route Inundation: 18%"></div>
            <div className="bg-[#00685f] h-full" style={{ width: '12%' }} title="Structural Resilience Offset: +12%"></div>
            <div className="bg-[#e6e8ea] h-full" style={{ width: '10%' }}></div>
          </div>

          {/* Attribution Legend Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-[#f2f4f6] border border-[#bcc9c6]/20">
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-[#0b1c30]">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Flood Plain Proximity
                </span>
                <span className="font-semibold text-rose-700">38% (-33 pts)</span>
              </div>
              <div className="text-[11px] text-[#565e74]">Facility situated 420m from Karha river channel.</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#f2f4f6] border border-[#bcc9c6]/20">
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-[#0b1c30]">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  Cold Chain Energy Fragility
                </span>
                <span className="font-semibold text-amber-700">22% (-19 pts)</span>
              </div>
              <div className="text-[11px] text-[#565e74]">Grid power fluctuation during heatwave peaks.</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#f2f4f6] border border-[#bcc9c6]/20">
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-[#0b1c30]">
                  <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                  Supply Route Inundation
                </span>
                <span className="font-semibold text-rose-700">18% (-15 pts)</span>
              </div>
              <div className="text-[11px] text-[#565e74]">Baramati-Pune SH10 single access route wash risk.</div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#f2f4f6] border border-[#bcc9c6]/20">
              <div className="flex items-center justify-between font-mono text-[11px] mb-1">
                <span className="flex items-center gap-1.5 text-[#0b1c30]">
                  <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
                  Resilience Credit Offset
                </span>
                <span className="font-semibold text-[#00685f]">+12% (+10 pts)</span>
              </div>
              <div className="text-[11px] text-[#565e74]">Elevated plinth (+1.2m) & 72h backup diesel generator.</div>
            </div>
          </div>
        </div>
      </section>

      {/* Split Section: Satellite & Hydrological Geometry + Resilience Audit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column (7 cols): Map & Basin Geometry */}
        <div className="lg:col-span-7 bg-white border border-[#bcc9c6]/30 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="text-[16px] font-semibold text-[#0b1c30]">Location & Hydrological Boundary</h2>
              <p className="text-[12px] text-[#565e74]">
                Coordinates: {borrower.coordinates.lat}° N, {borrower.coordinates.lng}° E • Elevation: {borrower.elevationMsl}m MSL
              </p>
            </div>
            <button
              onClick={onNavigateToMap}
              className="font-mono text-[11px] px-2.5 py-1 rounded-md bg-[#e5eeff] text-[#00685f] hover:bg-[#dce9ff] border border-[#00685f]/30 font-semibold flex items-center gap-1 transition-colors"
            >
              <span>Inspect in Map Explorer</span>
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </button>
          </div>

          {/* Minimalist Vector Map Simulation */}
          <div className="relative w-full h-72 rounded-lg bg-[#f2f4f6] border border-[#bcc9c6]/40 overflow-hidden flex items-center justify-center">
            {/* SVG Cartographic Grid & River Basin */}
            <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid-sub" width="24" height="24" patternUnits="userSpaceOnUse">
                  <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#e2e8f0" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid-sub)" />

              {/* Karha River Flow */}
              <path d="M -10 180 C 120 190, 240 130, 360 140 C 480 150, 600 90, 750 110" fill="none" stroke="#38bdf8" strokeWidth="8" opacity="0.4" strokeLinecap="round" />
              <path d="M -10 180 C 120 190, 240 130, 360 140 C 480 150, 600 90, 750 110" fill="none" stroke="#0284c7" strokeWidth="2.5" opacity="0.8" strokeLinecap="round" />

              {/* 100-Year Flood Zone Contour Buffer */}
              <path d="M 180 110 C 230 70, 390 80, 440 120 C 490 160, 430 220, 330 210 C 240 200, 150 150, 180 110 Z" fill="#fee2e2" fillOpacity="0.4" stroke="#f87171" strokeWidth="1.5" strokeDasharray="3 3" />

              {/* SH-10 Road corridor */}
              <path d="M 120 300 L 290 160 L 520 60" fill="none" stroke="#94a3b8" strokeWidth="2.5" />
              <text x="140" y="270" fill="#64748b" fontFamily="JetBrains Mono" fontSize="9">SH-10 Pune Corridor</text>
              <text x="460" y="115" fill="#0369a1" fontFamily="JetBrains Mono" fontSize="10" fontWeight="500">Karha River Basin (Tributary)</text>
            </svg>

            {/* Marker Pin for Borrower Asset */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="flex items-center gap-1.5 bg-white border border-[#00685f] text-[#0b1c30] px-2.5 py-1 rounded-md shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></span>
                <span className="font-mono text-[11px] font-semibold">{borrower.name}</span>
              </div>
              <div className="w-0.5 h-4 bg-[#00685f]"></div>
              <div className="w-1.5 h-1.5 rounded-full bg-[#00685f]"></div>
            </div>

            {/* Bottom Overlay Info */}
            <div className="absolute bottom-2 left-2 bg-white/95 backdrop-blur-xs border border-[#bcc9c6]/40 rounded px-2.5 py-1 font-mono text-[10px] text-[#6d7a77]">
              Distance to River Channel: <span className="text-[#0b1c30] font-semibold">{borrower.riverBufferDistanceM}m</span> • Inundation Depth (100yr): <span className="text-rose-700 font-semibold">+{borrower.floodDepthModeledM}m</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#bcc9c6]/20 text-center">
            <div>
              <div className="font-mono text-[11px] text-[#6d7a77]">Basin Runoff Lag</div>
              <div className="font-mono text-[15px] font-semibold text-[#0b1c30]">4.5 Hours</div>
            </div>
            <div>
              <div className="font-mono text-[11px] text-[#6d7a77]">Soil Permeability</div>
              <div className="font-mono text-[15px] font-semibold text-[#0b1c30]">Black Cotton (Low)</div>
            </div>
            <div>
              <div className="font-mono text-[11px] text-[#6d7a77]">Micro Drainage Slope</div>
              <div className="font-mono text-[15px] font-semibold text-[#0b1c30]">1.2% SW</div>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Resilience & Mitigation Audit */}
        <div className="lg:col-span-5 bg-white border border-[#bcc9c6]/30 rounded-xl p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[16px] font-semibold text-[#0b1c30]">Resilience & Mitigation Audit</h2>
              <span className="font-mono text-[11px] px-2 py-0.5 rounded bg-[#f2f4f6] text-[#565e74] border border-[#bcc9c6]/30">
                4 Criteria
              </span>
            </div>
            <p className="text-[12px] text-[#565e74] mb-3">
              Verified on-site mitigation infrastructure offsetting climate default risk.
            </p>

            <div className="flex flex-col gap-2.5">
              {/* Item 1: Flood Insurance */}
              <div className="p-3 rounded-lg border border-[#bcc9c6]/30 bg-[#f2f4f6] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0 mt-0.5">verified</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">Flood & Inundation Insurance</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Active
                    </span>
                  </div>
                  <div className="text-[11px] text-[#565e74] mt-0.5">
                    ₹5.0 Cr cover (HDFC ERGO Policy #POL-9921), valid through March 2026.
                  </div>
                </div>
              </div>

              {/* Item 2: Diesel Generator Backup */}
              <div className="p-3 rounded-lg border border-[#bcc9c6]/30 bg-[#f2f4f6] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0 mt-0.5">verified</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">Diesel Generator Runtime</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </div>
                  <div className="text-[11px] text-[#565e74] mt-0.5">
                    72-hour autonomous standby with 5,000L fuel reserves on site.
                  </div>
                </div>
              </div>

              {/* Item 3: Plinth Height */}
              <div className="p-3 rounded-lg border border-[#bcc9c6]/30 bg-[#f2f4f6] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#00685f] text-[20px] shrink-0 mt-0.5">verified</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-[#0b1c30]">Elevated Plinth Construction</span>
                    <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                      +1.2m
                    </span>
                  </div>
                  <div className="text-[11px] text-[#565e74] mt-0.5">
                    Facility base raised 1.2m above 50-year historical high water level.
                  </div>
                </div>
              </div>

              {/* Item 4: Route Redundancy (Flagged) */}
              <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/50 flex items-start gap-2.5">
                <span className="material-symbols-outlined text-rose-600 text-[20px] shrink-0 mt-0.5">warning</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[13px] font-semibold text-rose-900">Transit Corridor Redundancy</span>
                    <span className="font-mono text-[10px] text-rose-800 bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
                      High Risk
                    </span>
                  </div>
                  <div className="text-[11px] text-rose-800 mt-0.5">
                    Single access road via SH10; secondary bypass currently unpaved.
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between text-[12px]">
            <span className="text-[#6d7a77]">Overall Mitigation Buffer:</span>
            <span className="font-mono font-semibold text-[#00685f]">Moderate (+10 pts Credit)</span>
          </div>
        </div>
      </div>

      {/* Underwriter Action & Loan Covenant Decision Box */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 flex flex-col gap-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-[#bcc9c6]/20 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#00685f] text-[22px]">gavel</span>
            <div>
              <h2 className="text-[16px] font-semibold text-[#0b1c30]">Underwriting Decision & Loan Covenants</h2>
              <p className="text-[12px] text-[#565e74]">Recommended actions driven by physical climate risk quantification</p>
            </div>
          </div>
          <span className={`font-mono text-[11px] px-2.5 py-1 rounded font-semibold ${
            covenantApproved
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
              : overridden
              ? 'bg-amber-100 text-amber-800 border border-amber-300'
              : 'bg-[#e5eeff] text-[#00685f] border border-[#00685f]/30'
          }`}>
            {covenantApproved ? 'Status: Approved with Covenants' : overridden ? 'Status: Overridden to Base Terms' : 'Recommended: Conditional Approval'}
          </span>
        </div>

        {/* Covenant details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#f2f4f6] p-4 rounded-lg border border-[#bcc9c6]/30">
            <div className="font-mono uppercase text-[10px] text-[#6d7a77] mb-1">
              Covenant Recommendation 1: Pricing Adjustment
            </div>
            <div className="text-[14px] font-semibold text-[#0b1c30] mb-1">
              Climate Risk Premium: +0.65% spread adjustment
            </div>
            <div className="text-[12px] text-[#565e74]">
              Base card rate of 9.75% adjusted to <span className="font-semibold text-[#0b1c30]">10.40% p.a.</span> to account for 7-day riverine surge probability and seasonal refrigeration strain.
            </div>
          </div>

          <div className="bg-[#f2f4f6] p-4 rounded-lg border border-[#bcc9c6]/30">
            <div className="font-mono uppercase text-[10px] text-[#6d7a77] mb-1">
              Covenant Recommendation 2: Operational Mandate
            </div>
            <div className="text-[14px] font-semibold text-[#0b1c30] mb-1">
              Mandate Secondary Transit Route & Continuous Policy
            </div>
            <div className="text-[12px] text-[#565e74]">
              Borrower to establish contractual tie-up for backup dry access road within 90 days; retain valid flood insurance endorsement throughout 36-month tenor.
            </div>
          </div>
        </div>

        {/* Final Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleRmAudit}
              className="h-9 px-3.5 bg-white border border-[#bcc9c6]/40 hover:bg-[#f2f4f6] text-[#3d4947] text-[12px] font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">assignment_return</span>
              <span>Request RM Site Audit</span>
            </button>
            <button
              type="button"
              onClick={handleOverride}
              className="h-9 px-3.5 bg-white border border-[#bcc9c6]/40 hover:bg-[#f2f4f6] text-[#3d4947] text-[12px] font-medium rounded-lg flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">undo</span>
              <span>Override to Base Terms</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleApprove}
            className={`w-full sm:w-auto h-9 px-5 text-white text-[12px] font-semibold rounded-lg flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-98 ${
              covenantApproved 
                ? 'bg-emerald-700 hover:bg-emerald-800' 
                : 'bg-[#00685f] hover:bg-[#008378]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">check_circle</span>
            <span>{covenantApproved ? 'Covenants Approved & Recorded' : 'Approve with Recommended Covenants'}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
