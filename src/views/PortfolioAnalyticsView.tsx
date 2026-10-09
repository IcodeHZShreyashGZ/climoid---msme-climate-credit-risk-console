import React, { useState } from 'react';
import { PORTFOLIO_MSME_EXPANDED } from '../data/mockData';

interface PortfolioAnalyticsViewProps {
  onReRunScenarios: () => void;
  onExportPillar3: () => void;
  onSelectBorrowerDossier: (name: string) => void;
}

export function PortfolioAnalyticsView({
  onReRunScenarios,
  onExportPillar3,
  onSelectBorrowerDossier,
}: PortfolioAnalyticsViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSector, setSelectedSector] = useState('all');
  const [selectedHazard, setSelectedHazard] = useState('all');
  const [sortDescending, setSortDescending] = useState(true);
  const [page, setPage] = useState(1);
  const [queuedAction, setQueuedAction] = useState<string | null>(null);

  const filteredRecords = PORTFOLIO_MSME_EXPANDED.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.gstin.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.district.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSector = selectedSector === 'all' || item.sector.toLowerCase().includes(selectedSector.toLowerCase());
    const matchesHazard = selectedHazard === 'all' || item.peril.toLowerCase().includes(selectedHazard.toLowerCase());
    return matchesSearch && matchesSector && matchesHazard;
  }).sort((a, b) => sortDescending ? b.exposureCr - a.exposureCr : a.exposureCr - b.exposureCr);

  const handleQueueAction = (actionName: string) => {
    setQueuedAction(`Action Queued: "${actionName}" submitted to credit committee workflow.`);
    setTimeout(() => setQueuedAction(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1536px] mx-auto select-none">
      {/* Toast Notification */}
      {queuedAction && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
            <span>{queuedAction}</span>
          </div>
          <button onClick={() => setQueuedAction(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Breadcrumbs & Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#565e74] mb-1">
            <span>Portfolio</span>
            <span>/</span>
            <span>MSME Underwriting Book</span>
            <span>/</span>
            <span className="text-[#0b1c30] font-semibold">Actuarial Stress Testing</span>
          </div>
          <h1 className="text-[24px] font-bold text-[#0b1c30] tracking-tight">Underwritten Portfolio Climate Analytics</h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f2f4f6] border border-[#bcc9c6]/40 font-mono text-[11px] text-[#565e74]">
            CAT MODEL: NGFS NET ZERO 2050 (SSP2-4.5)
          </span>

          <button
            type="button"
            onClick={onReRunScenarios}
            className="h-8 px-3 rounded-lg bg-white border border-[#bcc9c6]/40 text-[#0b1c30] text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#f2f4f6] transition-colors shadow-2xs"
          >
            <span className="material-symbols-outlined text-[16px]">tune</span>
            <span>Re-run Stress Scenarios</span>
          </button>
        </div>
      </div>

      {/* ================= TOP PORTFOLIO KPI TICKER BAR ================= */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Book Size */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#565e74]">
            <span className="text-[12px] font-medium">Total Book Size</span>
            <span className="font-mono text-[10px]">LOANS COUNT</span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-[30px] font-bold text-[#0b1c30]">
              ₹1,420<span className="text-[15px] font-normal text-[#565e74]"> Cr</span>
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eceef0] pt-2">
            <span className="text-[11px] text-[#565e74]">Across 1,280 MSME facilities</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#0b1c30] font-bold">
              100% AUDITED
            </span>
          </div>
        </div>

        {/* KPI 2: Climate Risk Score */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#565e74]">
            <span className="text-[12px] font-medium">Weighted Climate Risk Score</span>
            <span className="font-mono text-[10px] text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 font-bold">
              ELEVATED
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-[30px] font-bold text-amber-700">
              71.4 <span className="text-[15px] font-normal text-[#565e74]">/ 100</span>
            </span>
            <span className="font-mono text-[11px] text-rose-700 bg-rose-50 px-1 py-0.5 rounded font-medium">
              +3.2 vs Q3
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eceef0] pt-2">
            <span className="text-[11px] text-[#565e74]">Threshold Ceiling: 65.0</span>
            <span className="font-mono text-[10px] text-[#565e74]">TOP: FLUVIAL FLOOD</span>
          </div>
        </div>

        {/* KPI 3: Provisioning Surplus/Gap */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#565e74]">
            <span className="text-[12px] font-medium">Provisioning Surplus / Gap</span>
            <span className="font-mono text-[10px] text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 font-bold">
              SOLVENT
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-[30px] font-bold text-[#00685f]">
              +₹12.4<span className="text-[15px] font-normal text-[#565e74]"> Cr</span>
            </span>
            <span className="font-mono text-[11px] text-[#00685f] bg-[#89f5e7]/30 px-1 py-0.5 rounded font-bold">
              +8.7% QoQ
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eceef0] pt-2">
            <span className="text-[11px] text-[#565e74]">ECL Coverage Ratio: 114.2%</span>
            <span className="font-mono text-[10px] text-[#565e74]">RBI PILLAR 2 OK</span>
          </div>
        </div>

        {/* KPI 4: Carbon & Physical VaR */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-4 flex flex-col justify-between shadow-xs">
          <div className="flex items-center justify-between text-[#565e74]">
            <span className="text-[12px] font-medium">Carbon & Physical Hazard VaR</span>
            <span className="font-mono text-[10px] text-rose-800 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200 font-bold">
              99% CONF.
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="font-mono text-[30px] font-bold text-[#0b1c30]">
              ₹62.1<span className="text-[15px] font-normal text-[#565e74]"> Cr</span>
            </span>
            <span className="font-mono text-[11px] text-[#565e74]">1-Yr Horizon</span>
          </div>
          <div className="mt-2 flex items-center justify-between border-t border-[#eceef0] pt-2">
            <span className="text-[11px] text-[#565e74]">4.37% of Aggregate Capital</span>
            <span className="font-mono text-[10px] text-[#565e74]">TAIL TA-99</span>
          </div>
        </div>
      </section>

      {/* ================= BENTO GRID: Treemap & Waterfall ================= */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* 1. Concentration by Hazard & Sector (Treemap Card) */}
        <div className="lg:col-span-7 bg-white border border-[#bcc9c6]/30 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[#eceef0]">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[15px] text-[#0b1c30]">Concentration by Hazard & Sector</h3>
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#565e74] font-semibold">
                  MSME TREEMAP
                </span>
              </div>
              <p className="text-[12px] text-[#565e74] mt-0.5">Asset size partition weighted by catastrophic vulnerability index</p>
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span className="flex items-center gap-1 text-[#0b1c30]">
                <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
                <span>Critical (&gt;80)</span>
              </span>
              <span className="flex items-center gap-1 text-[#0b1c30]">
                <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                <span>Moderate (50-80)</span>
              </span>
              <span className="flex items-center gap-1 text-[#0b1c30]">
                <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
                <span>Resilient (&lt;50)</span>
              </span>
            </div>
          </div>

          {/* Treemap Layout */}
          <div className="grid grid-cols-12 gap-2.5 mt-4 min-h-[340px]">
            {/* Sector 1: Food Processing */}
            <div className="col-span-7 row-span-2 bg-rose-50 border border-rose-200 rounded-lg p-3 flex flex-col justify-between group hover:border-rose-400 transition-colors shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
                    FLUVIAL FLOOD + HEAT
                  </span>
                  <h4 className="text-[16px] font-bold text-[#0b1c30] mt-1.5">Food Processing</h4>
                  <p className="text-[11px] text-[#565e74]">384 Borrowers • Thane & Pune Belts</p>
                </div>
                <span className="font-mono text-[11px] text-rose-800 font-bold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                  CRS: 84.2
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-4">
                <span className="font-mono text-[20px] font-bold text-[#0b1c30]">₹540.0 Cr</span>
                <span className="font-mono text-[11px] text-rose-700 font-semibold">38.0% Exposure</span>
              </div>
            </div>

            {/* Sector 2: Auto Components */}
            <div className="col-span-5 bg-amber-50 border border-amber-200 rounded-lg p-3 flex flex-col justify-between group hover:border-amber-400 transition-colors shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] text-amber-800 bg-white px-1.5 py-0.5 rounded border border-amber-200 font-semibold">
                    WATER STRESS
                  </span>
                  <h4 className="text-[14px] font-bold text-[#0b1c30] mt-1">Auto Components</h4>
                  <p className="text-[11px] text-[#565e74]">290 MSMEs • Pimpri-Chinchwad</p>
                </div>
                <span className="font-mono text-[10px] text-amber-800 font-bold bg-amber-100 px-1.5 py-0.5 rounded border border-amber-200">
                  CRS: 68.1
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-mono text-[17px] font-bold text-[#0b1c30]">₹355.0 Cr</span>
                <span className="font-mono text-[11px] text-amber-800 font-semibold">25.0% Exposure</span>
              </div>
            </div>

            {/* Sector 3: Cold Storage */}
            <div className="col-span-5 bg-rose-50/70 border border-rose-200 rounded-lg p-3 flex flex-col justify-between group hover:border-rose-400 transition-colors shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] text-rose-700 bg-white px-1.5 py-0.5 rounded border border-rose-200 font-semibold">
                    HEATWAVE DOWNTIME
                  </span>
                  <h4 className="text-[14px] font-bold text-[#0b1c30] mt-1">Cold Storage Chain</h4>
                  <p className="text-[11px] text-[#565e74]">142 Hubs • Nashik & Solapur</p>
                </div>
                <span className="font-mono text-[10px] text-rose-800 font-bold bg-rose-100 px-1.5 py-0.5 rounded border border-rose-200">
                  CRS: 77.9
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-mono text-[17px] font-bold text-[#0b1c30]">₹227.2 Cr</span>
                <span className="font-mono text-[11px] text-rose-800 font-semibold">16.0% Exposure</span>
              </div>
            </div>

            {/* Sector 4: Textiles */}
            <div className="col-span-7 bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex flex-col justify-between group hover:border-emerald-400 transition-colors shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] text-emerald-800 bg-white px-1.5 py-0.5 rounded border border-emerald-200 font-semibold">
                    FLOODPROOFED BUNDING
                  </span>
                  <h4 className="text-[14px] font-bold text-[#0b1c30] mt-1">Textiles & Spinning</h4>
                  <p className="text-[11px] text-[#565e74]">264 Mills • Ichalkaranji</p>
                </div>
                <span className="font-mono text-[10px] text-emerald-800 font-bold bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200">
                  CRS: 41.5
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-mono text-[17px] font-bold text-[#0b1c30]">₹170.4 Cr</span>
                <span className="font-mono text-[11px] text-emerald-800 font-semibold">12.0% Exposure</span>
              </div>
            </div>

            {/* Sector 5: Agri Warehouses */}
            <div className="col-span-5 bg-[#f2f4f6] border border-[#bcc9c6]/40 rounded-lg p-3 flex flex-col justify-between group hover:border-[#bcc9c6] transition-colors shadow-2xs">
              <div className="flex justify-between items-start">
                <div>
                  <span className="font-mono text-[10px] text-[#565e74] bg-white px-1.5 py-0.5 rounded border border-[#bcc9c6]/40 font-semibold">
                    DROUGHT VULNERABILITY
                  </span>
                  <h4 className="text-[14px] font-bold text-[#0b1c30] mt-1">Agri Warehouses</h4>
                  <p className="text-[11px] text-[#565e74]">200 Facilities</p>
                </div>
                <span className="font-mono text-[10px] text-[#565e74] font-bold bg-white px-1.5 py-0.5 rounded border border-[#bcc9c6]/30">
                  CRS: 56.0
                </span>
              </div>
              <div className="flex items-baseline justify-between pt-2">
                <span className="font-mono text-[17px] font-bold text-[#0b1c30]">₹127.4 Cr</span>
                <span className="font-mono text-[11px] text-[#565e74]">9.0% Exposure</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[12px] text-[#565e74] border-t border-[#eceef0] pt-3 mt-4">
            <span className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-[#00685f]">info</span>
              Treemap area is proportional to outstanding gross credit exposure.
            </span>
            <span className="font-mono text-[11px] text-[#00685f] font-semibold cursor-pointer hover:underline">
              View 100-Year Return Period Map →
            </span>
          </div>
        </div>

        {/* 2. Expected Loss (EL) Waterfall Chart Card */}
        <div className="lg:col-span-5 bg-white border border-[#bcc9c6]/30 rounded-xl p-6 flex flex-col justify-between shadow-xs">
          <div className="pb-3 border-b border-[#eceef0]">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[15px] text-[#0b1c30]">Expected Loss Stress Waterfall</h3>
              <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-[#f2f4f6] text-[#565e74] font-semibold">
                ACTUARIAL MODEL
              </span>
            </div>
            <p className="text-[12px] text-[#565e74] mt-0.5">Base expected loss stressed through direct hazards and mitigated coverage</p>
          </div>

          {/* Waterfall Steps */}
          <div className="flex flex-col gap-3 py-3">
            {/* Step 1: Base EL */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-medium text-[#0b1c30]">1. Baseline Credit EL (Pre-Climate)</span>
                <span className="font-mono font-semibold text-[#0b1c30]">₹18.2 Cr</span>
              </div>
              <div className="w-full bg-[#eceef0] h-4 rounded overflow-hidden flex">
                <div className="bg-[#bec6e0] h-full" style={{ width: '51%' }}></div>
              </div>
            </div>

            {/* Step 2: Direct Physical Hazard */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-medium text-rose-700">+ Direct Physical Facility Damage</span>
                <span className="font-mono font-bold text-rose-700">+₹14.8 Cr</span>
              </div>
              <div className="w-full bg-[#eceef0] h-4 rounded overflow-hidden flex">
                <div className="bg-transparent h-full" style={{ width: '51%' }}></div>
                <div className="bg-rose-500 h-full" style={{ width: '41%' }}></div>
              </div>
            </div>

            {/* Step 3: Supply Chain Disruption */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-medium text-amber-700">+ Supply Chain & Power Grid Halt</span>
                <span className="font-mono font-bold text-amber-700">+₹9.1 Cr</span>
              </div>
              <div className="w-full bg-[#eceef0] h-4 rounded overflow-hidden flex">
                <div className="bg-transparent h-full" style={{ width: '92%' }}></div>
                <div className="bg-amber-500 h-full" style={{ width: '25%' }}></div>
              </div>
            </div>

            {/* Step 4: Collateral Mitigation */}
            <div className="flex flex-col gap-1">
              <div className="flex justify-between items-center text-[12px]">
                <span className="font-medium text-[#00685f]">- Collateral & Parametric Insurance</span>
                <span className="font-mono font-bold text-[#00685f]">-₹6.5 Cr</span>
              </div>
              <div className="w-full bg-[#eceef0] h-4 rounded overflow-hidden flex">
                <div className="bg-transparent h-full" style={{ width: '99%' }}></div>
                <div className="bg-[#00685f] h-full" style={{ width: '18%' }}></div>
              </div>
            </div>

            {/* Stressed EL Result */}
            <div className="border-t border-dashed border-[#bcc9c6]/40 my-1 pt-2">
              <div className="flex justify-between items-center text-[13px] mb-1">
                <span className="font-bold text-[#0b1c30]">Stressed Portfolio EL (Climate Post-Mitigation)</span>
                <span className="font-mono font-bold text-[16px] text-[#0b1c30]">₹35.6 Cr</span>
              </div>
              <div className="w-full bg-[#eceef0] h-5 rounded overflow-hidden flex border border-[#bcc9c6]/30">
                <div className="bg-[#0b1c30] h-full" style={{ width: '100%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-[#f8f9ff] rounded-lg p-3 border border-[#bcc9c6]/30 flex items-center justify-between">
            <div>
              <p className="font-mono uppercase text-[9px] text-[#565e74]">ECL Stressed Delta</p>
              <p className="font-mono text-[13px] font-bold text-rose-700">+95.6% Elevation over Base</p>
            </div>
            <span className="font-mono text-[10px] px-2 py-1 rounded bg-white border border-[#bcc9c6]/40 text-[#0b1c30] font-semibold">
              RBI DRAFT GUIDELINE MODEL
            </span>
          </div>
        </div>
      </section>

      {/* ================= 3. DE-RISKING PANEL ================= */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-[#eceef0]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00685f]"></span>
              <h3 className="font-semibold text-[15px] text-[#0b1c30]">
                Actuarial De-Risking & Portfolio Optimization Recommendations
              </h3>
            </div>
            <p className="text-[12px] text-[#565e74] mt-0.5">
              Automated programmatic actions to reconcile portfolio with 1.5°C climate pathway and reduce capital charge
            </p>
          </div>
          <span className="font-mono text-[10px] text-[#565e74] font-semibold">3 PENDING COMMITTEE ACTIONS</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Card 1 */}
          <div className="border border-[#bcc9c6]/30 rounded-lg p-4 bg-[#f8f9ff] flex flex-col justify-between hover:border-[#00685f] transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                  HIGH CAPITAL IMPACT
                </span>
                <span className="font-mono text-[10px] text-[#565e74]">ACTION #01</span>
              </div>
              <h4 className="font-semibold text-[13px] text-[#0b1c30] mt-2">Shift Exposure from High-Fluvial Pune Basin</h4>
              <p className="text-[12px] text-[#565e74] mt-1 leading-relaxed">
                Relocate <strong className="text-[#0b1c30]">₹45.0 Cr</strong> upcoming renewal limit from flood-prone Mutha river corridor to high-elevation inland manufacturing hubs in Chakan Phase IV.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#00685f] font-bold">VAR SAVINGS: -₹8.4 Cr</span>
              <button
                type="button"
                onClick={() => handleQueueAction('Shift Exposure Pune Basin')}
                className="text-[12px] text-[#00685f] hover:text-[#008378] font-semibold inline-flex items-center gap-1"
              >
                Queue Draft <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Card 2 */}
          <div className="border border-[#bcc9c6]/30 rounded-lg p-4 bg-[#f8f9ff] flex flex-col justify-between hover:border-[#00685f] transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 font-bold border border-amber-200">
                  UNDERWRITING COVENANT
                </span>
                <span className="font-mono text-[10px] text-[#565e74]">ACTION #02</span>
              </div>
              <h4 className="font-semibold text-[13px] text-[#0b1c30] mt-2">Mandate Parametric Rainfall Insurance</h4>
              <p className="text-[12px] text-[#565e74] mt-1 leading-relaxed">
                Enforce automatic trigger parametric insurance for all 42 agri-processing units in Thane book with rainfall deficit &gt;25% for 3 consecutive weeks.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#00685f] font-bold">COVERAGE: +₹22.0 Cr</span>
              <button
                type="button"
                onClick={() => handleQueueAction('Mandate Parametric Insurance')}
                className="text-[12px] text-[#00685f] hover:text-[#008378] font-semibold inline-flex items-center gap-1"
              >
                Apply Covenant <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>

          {/* Card 3 */}
          <div className="border border-[#bcc9c6]/30 rounded-lg p-4 bg-[#f8f9ff] flex flex-col justify-between hover:border-[#00685f] transition-colors shadow-2xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  ESG INCENTIVE
                </span>
                <span className="font-mono text-[10px] text-[#565e74]">ACTION #03</span>
              </div>
              <h4 className="font-semibold text-[13px] text-[#0b1c30] mt-2">Spread Discount for Solar & Flood Bunds</h4>
              <p className="text-[12px] text-[#565e74] mt-1 leading-relaxed">
                Extend a 15 bps coupon relief for Cold Chain borrowers investing &gt;₹15 Lakh in microgrid battery backups and elevated flood barriers.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-[#bcc9c6]/20 flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#00685f] font-bold">DEFAULT RISK: -18%</span>
              <button
                type="button"
                onClick={() => handleQueueAction('Review 15 bps Discount Program')}
                className="text-[12px] text-[#00685f] hover:text-[#008378] font-semibold inline-flex items-center gap-1"
              >
                Review Program <span className="material-symbols-outlined text-[15px]">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= 4. FULL PORTFOLIO EXPORTABLE DATA TABLE ================= */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl shadow-xs overflow-hidden mb-6">
        <div className="p-4 border-b border-[#eceef0] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 w-full md:w-auto flex-wrap">
            {/* Table Search */}
            <div className="relative w-full md:w-72">
              <span className="material-symbols-outlined absolute left-2.5 top-2 text-[17px] text-[#565e74]">search</span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search facility name, GSTIN, district..."
                className="w-full h-8 pl-8 pr-3 text-[12px] bg-[#f8f9ff] border border-[#bcc9c6]/40 rounded-lg text-[#0b1c30] placeholder:text-[#565e74] focus:outline-none focus:border-[#00685f]"
              />
            </div>

            {/* Sector Filter */}
            <select
              value={selectedSector}
              onChange={(e) => setSelectedSector(e.target.value)}
              className="h-8 px-2.5 bg-[#f8f9ff] border border-[#bcc9c6]/40 rounded-lg text-[12px] text-[#0b1c30] focus:outline-none focus:border-[#00685f]"
            >
              <option value="all">All Sectors</option>
              <option value="food">Food Processing</option>
              <option value="auto">Auto Components</option>
              <option value="cold">Cold Storage</option>
              <option value="textiles">Textiles</option>
              <option value="agri">Agri Warehouses</option>
            </select>

            {/* Hazard Filter */}
            <select
              value={selectedHazard}
              onChange={(e) => setSelectedHazard(e.target.value)}
              className="h-8 px-2.5 bg-[#f8f9ff] border border-[#bcc9c6]/40 rounded-lg text-[12px] text-[#0b1c30] focus:outline-none focus:border-[#00685f]"
            >
              <option value="all">All Hazards</option>
              <option value="flood">Fluvial Flooding</option>
              <option value="heat">Grid Fail / Heat</option>
              <option value="drought">Groundwater / Drought</option>
              <option value="surge">Storm Surge / Tidal</option>
            </select>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            <button
              type="button"
              onClick={() => setSortDescending(!sortDescending)}
              className="h-8 px-3 rounded-lg bg-white border border-[#bcc9c6]/40 text-[#0b1c30] text-[12px] font-medium flex items-center gap-1.5 hover:bg-[#f2f4f6]"
            >
              <span className="material-symbols-outlined text-[16px]">filter_list</span>
              <span>Sort: Exposure ({sortDescending ? 'Desc' : 'Asc'})</span>
            </button>

            <button
              type="button"
              onClick={onExportPillar3}
              className="h-8 px-3.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-semibold flex items-center gap-1.5 transition-colors shadow-xs active:scale-98"
            >
              <span className="material-symbols-outlined text-[16px]">download</span>
              <span>Download Pillar 3 Disclosure</span>
            </button>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead>
              <tr className="bg-[#f8f9ff] border-b border-[#eceef0] font-mono text-[10px] text-[#565e74] uppercase tracking-wider">
                <th className="py-2.5 px-4 font-semibold">Borrower / Entity</th>
                <th className="py-2.5 px-4 font-semibold">Sector</th>
                <th className="py-2.5 px-4 font-semibold">District / Basin</th>
                <th className="py-2.5 px-4 font-semibold text-right">Exposure (Cr)</th>
                <th className="py-2.5 px-4 font-semibold text-right">Risk Score</th>
                <th className="py-2.5 px-4 font-semibold">Primary Peril</th>
                <th className="py-2.5 px-4 font-semibold text-right">Stressed EL</th>
                <th className="py-2.5 px-4 font-semibold">Mitigation Status</th>
                <th className="py-2.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#eceef0]">
              {filteredRecords.map((item, idx) => (
                <tr key={idx} className="hover:bg-[#f8f9ff] transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-semibold text-[#0b1c30]">{item.name}</div>
                    <div className="text-[11px] text-[#565e74] font-mono">GSTIN: {item.gstin}</div>
                  </td>
                  <td className="py-3 px-4 text-[#0b1c30]">{item.sector}</td>
                  <td className="py-3 px-4">
                    <span className="text-[#0b1c30] font-medium">{item.district}</span>
                    <span className="text-[11px] text-[#565e74] block font-mono">{item.basin}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#0b1c30]">
                    ₹{item.exposureCr.toFixed(2)}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[11px] font-bold border ${
                      item.riskScore > 80
                        ? 'bg-rose-100 text-rose-800 border-rose-200'
                        : item.riskScore > 50
                        ? 'bg-amber-100 text-amber-800 border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                    }`}>
                      {item.riskScore.toFixed(1)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] text-[#0b1c30] bg-[#f2f4f6] px-1.5 py-0.5 rounded border border-[#bcc9c6]/30">
                      {item.peril}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-rose-700 font-bold">
                    ₹{item.stressedElCr.toFixed(2)} Cr
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1 font-mono text-[10px] px-2 py-0.5 rounded border ${
                      item.mitigationColor === 'emerald'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : item.mitigationColor === 'amber'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : 'bg-[#f2f4f6] text-[#565e74] border-[#bcc9c6]/40'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        item.mitigationColor === 'emerald' ? 'bg-emerald-600' : item.mitigationColor === 'amber' ? 'bg-amber-500' : 'bg-gray-400'
                      }`}></span>
                      {item.mitigationStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onSelectBorrowerDossier(item.name)}
                      className="text-[#565e74] hover:text-[#00685f] transition-colors p-1"
                      title="View Underwriting Dossier"
                    >
                      <span className="material-symbols-outlined text-[18px]">open_in_new</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Audit Meta */}
        <div className="p-3.5 border-t border-[#eceef0] flex flex-col sm:flex-row items-center justify-between text-[12px] text-[#565e74] gap-3">
          <div className="flex items-center gap-2">
            <span>Displaying {filteredRecords.length} of 1,280 audited loan records</span>
            <span className="text-[#bcc9c6]">•</span>
            <span className="font-mono text-[10px]">CAT ENGINE: CLIMOID-ACTUARIAL V4.1.2</span>
          </div>

          <div className="flex items-center gap-1 font-mono text-[11px]">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-2.5 py-1 rounded border border-[#bcc9c6]/40 text-[#0b1c30] bg-white hover:bg-[#f2f4f6] disabled:opacity-40"
            >
              Previous
            </button>
            <button type="button" className="px-2.5 py-1 rounded border border-[#00685f] bg-[#00685f] text-white font-bold">1</button>
            <button type="button" className="px-2.5 py-1 rounded border border-[#bcc9c6]/40 text-[#0b1c30] bg-white hover:bg-[#f2f4f6]">2</button>
            <button type="button" className="px-2.5 py-1 rounded border border-[#bcc9c6]/40 text-[#0b1c30] bg-white hover:bg-[#f2f4f6]">3</button>
            <span className="px-1 text-[#565e74]">...</span>
            <button type="button" className="px-2.5 py-1 rounded border border-[#bcc9c6]/40 text-[#0b1c30] bg-white hover:bg-[#f2f4f6]">256</button>
            <button
              type="button"
              onClick={() => setPage(p => p + 1)}
              className="px-2.5 py-1 rounded border border-[#bcc9c6]/40 text-[#0b1c30] bg-white hover:bg-[#f2f4f6]"
            >
              Next
            </button>
          </div>
        </div>
      </section>

      {/* Regulatory Compliance Footer Note */}
      <footer className="mt-1 mb-8 flex flex-col md:flex-row items-center justify-between text-[11px] text-[#565e74] border-t border-[#eceef0] pt-4 gap-2">
        <p>Audit Trail ID: <span className="font-mono font-semibold text-[#0b1c30]">CLM-2025-Q1-99824B</span> • Benchmarked against NGFS Scenarios & RBI Financial Stability Board taxonomy.</p>
        <p className="font-mono">Last Synced: Today at 14:32:04 IST • 1,280 Loan Records Processed</p>
      </footer>
    </div>
  );
}
