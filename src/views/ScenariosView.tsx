import React, { useState } from 'react';
import { ScenarioSettings, ScenarioRunResult } from '../types';

interface ScenariosViewProps {
  onExportReport: () => void;
  onNavigateToMap: () => void;
}

export function ScenariosView({ onExportReport, onNavigateToMap }: ScenariosViewProps) {
  const [pathway, setPathway] = useState<'SSP2-4.5' | 'SSP5-8.5'>('SSP2-4.5');
  const [timeHorizon, setTimeHorizon] = useState<2030 | 2040 | 2050>(2040);
  const [floodDepthMult, setFloodDepthMult] = useState<number>(25); // +25%
  const [heatwaveDays, setHeatwaveDays] = useState<number>(18); // +18d
  const [droughtMult, setDroughtMult] = useState<number>(1.5); // 1.5x
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationCount, setSimulationCount] = useState<number>(4092);

  // Dynamic simulation multipliers based on selected pathway and horizon
  const isExtreme = pathway === 'SSP5-8.5';
  const horizonMultiplier = timeHorizon === 2030 ? 0.75 : timeHorizon === 2040 ? 1.0 : 1.35;
  const pathwayFactor = isExtreme ? 1.4 : 1.0;

  const scoreDrop = Math.round(14 * horizonMultiplier * (isExtreme ? 1.5 : 1.0));
  const stressedScore = Math.max(42, 72 - scoreDrop);
  const stressedEl = (14.2 * (1 + 1.725 * horizonMultiplier * pathwayFactor * 0.6)).toFixed(1);
  const elShock = Math.round(((Number(stressedEl) - 14.2) / 14.2) * 100);
  const stressedPd = (2.10 + 3.30 * horizonMultiplier * (isExtreme ? 1.35 : 1.0)).toFixed(2);
  const pdDeltaBps = Math.round((Number(stressedPd) - 2.10) * 100);
  const cet1Stressed = Math.max(9.2, (14.8 - 3.2 * horizonMultiplier * (isExtreme ? 1.4 : 1.0))).toFixed(1);
  const reqProvision = (26.4 * horizonMultiplier * pathwayFactor).toFixed(1);

  const handleRunSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      setSimulationCount(prev => prev + 1);
    }, 900);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1536px] mx-auto select-none">
      {/* Breadcrumbs & Headline View Context */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[#565e74] mb-1">
            <span>PORTFOLIO ASSETS</span>
            <span>/</span>
            <span>STRESS ENGINES</span>
            <span>/</span>
            <span className="text-[#00685f] font-semibold">SIMULATION RUN #{simulationCount}-B</span>
          </div>
          <h1 className="text-[26px] font-bold text-[#0b1c30] tracking-tight">Macro Scenario Stress-Testing</h1>
          <p className="text-[13px] text-[#565e74] mt-0.5">
            Stressed loss quantification and capital adequacy impact across severe forward physical shocks.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f2f4f6] border border-[#bcc9c6]/40 font-mono text-[11px] text-[#3d4947]">
            BASE MODEL: NGFS PHASE IV ACTIVE
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#f8f9ff] border border-[#bcc9c6]/40 font-mono text-[11px] text-[#565e74]">
            VAL DATE: 31-DEC-2024
          </span>
        </div>
      </div>

      {/* Top Scenario Configuration Control Bar */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Climate Pathways Toggle */}
          <div className="lg:col-span-4 flex flex-col gap-2">
            <label className="font-mono text-[10px] text-[#565e74] uppercase tracking-wider flex items-center justify-between">
              <span>Climate Pathway (IPCC AR6)</span>
              <span className="text-[#00685f] cursor-pointer hover:underline">Methodology Docs</span>
            </label>
            <div className="grid grid-cols-2 p-1 bg-[#f2f4f6] border border-[#bcc9c6]/40 rounded-lg gap-1">
              <button
                type="button"
                onClick={() => setPathway('SSP2-4.5')}
                className={`py-2 px-3 rounded text-left transition-all ${
                  pathway === 'SSP2-4.5'
                    ? 'bg-white border border-[#bcc9c6]/50 text-[#0b1c30] shadow-xs'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold">SSP2-4.5</span>
                  <span className="font-mono text-[10px] text-[#565e74]">MODERATE</span>
                </div>
                <p className="text-[10px] text-[#565e74] mt-0.5 truncate leading-tight">Current trajectories (+2.7°C)</p>
              </button>

              <button
                type="button"
                onClick={() => setPathway('SSP5-8.5')}
                className={`py-2 px-3 rounded text-left transition-all ${
                  pathway === 'SSP5-8.5'
                    ? 'bg-white border border-[#bcc9c6]/50 text-[#0b1c30] shadow-xs'
                    : 'text-[#565e74] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold">SSP5-8.5</span>
                  <span className="font-mono text-[10px] text-rose-700 font-bold">EXTREME</span>
                </div>
                <p className="text-[10px] text-[#565e74] mt-0.5 truncate leading-tight">High fossil baseline (+4.4°C)</p>
              </button>
            </div>
          </div>

          {/* Time Horizon Slider */}
          <div className="lg:col-span-3 flex flex-col gap-2 border-l border-[#bcc9c6]/30 pl-0 lg:pl-5">
            <div className="flex items-center justify-between">
              <label className="font-mono text-[10px] text-[#565e74] uppercase tracking-wider">Time Horizon</label>
              <span className="font-mono text-[12px] text-[#00685f] font-bold">TARGET: {timeHorizon}</span>
            </div>
            <div className="py-1">
              <input
                type="range"
                min="2030"
                max="2050"
                step="10"
                value={timeHorizon}
                onChange={(e) => setTimeHorizon(Number(e.target.value) as 2030 | 2040 | 2050)}
                className="w-full accent-[#00685f] h-1.5 bg-[#eceef0] rounded cursor-pointer"
              />
              <div className="flex justify-between font-mono text-[10px] text-[#565e74] mt-2">
                <span onClick={() => setTimeHorizon(2030)} className={`cursor-pointer ${timeHorizon === 2030 ? 'text-[#00685f] font-bold' : ''}`}>2030</span>
                <span onClick={() => setTimeHorizon(2040)} className={`cursor-pointer ${timeHorizon === 2040 ? 'text-[#00685f] font-bold' : ''}`}>2040</span>
                <span onClick={() => setTimeHorizon(2050)} className={`cursor-pointer ${timeHorizon === 2050 ? 'text-[#00685f] font-bold' : ''}`}>2050</span>
              </div>
            </div>
          </div>

          {/* Hazard Stress Multipliers */}
          <div className="lg:col-span-3 flex flex-col gap-2 border-l border-[#bcc9c6]/30 pl-0 lg:pl-5">
            <label className="font-mono text-[10px] text-[#565e74] uppercase tracking-wider">Hazard Stress Multipliers</label>
            <div className="flex items-center gap-2">
              <div className="flex-1 px-2.5 py-1.5 bg-[#f2f4f6] border border-[#bcc9c6]/40 rounded-lg">
                <span className="block font-mono text-[9px] text-[#565e74] uppercase">Flood Depth</span>
                <span className="font-mono text-[12px] font-bold text-rose-700 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">trending_up</span> +{floodDepthMult}%
                </span>
              </div>
              <div className="flex-1 px-2.5 py-1.5 bg-[#f2f4f6] border border-[#bcc9c6]/40 rounded-lg">
                <span className="block font-mono text-[9px] text-[#565e74] uppercase">Heatwave</span>
                <span className="font-mono text-[12px] font-bold text-rose-700 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">arrow_upward</span> +{heatwaveDays}d
                </span>
              </div>
              <div className="flex-1 px-2.5 py-1.5 bg-[#f2f4f6] border border-[#bcc9c6]/40 rounded-lg">
                <span className="block font-mono text-[9px] text-[#565e74] uppercase">Drought Idx</span>
                <span className="font-mono text-[12px] font-bold text-rose-700 flex items-center gap-0.5">
                  <span className="material-symbols-outlined text-[13px]">speed</span> +{droughtMult}x
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="lg:col-span-2 flex flex-col justify-end">
            <button
              type="button"
              onClick={handleRunSimulation}
              disabled={isSimulating}
              className="w-full h-11 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white font-semibold text-[13px] flex items-center justify-center gap-2 transition-all shadow-xs active:scale-98 disabled:opacity-60"
            >
              <span className={`material-symbols-outlined text-[18px] ${isSimulating ? 'animate-spin' : ''}`}>
                {isSimulating ? 'refresh' : 'play_circle'}
              </span>
              <span>{isSimulating ? 'Simulating...' : 'Run Portfolio Simulation'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Results Grid: 3 Comparative KPI Cards */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Score Delta Card */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono uppercase text-[10px] text-[#565e74]">Portfolio Resilience Score</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
              -{scoreDrop} PTS DROP
            </span>
          </div>

          <div className="flex items-baseline gap-4 mt-1">
            <div>
              <span className="block font-mono text-[10px] text-[#565e74]">BASE</span>
              <span className="font-mono text-[32px] font-bold text-[#0b1c30]">72</span>
            </div>
            <span className="material-symbols-outlined text-[#565e74] text-[20px]">arrow_forward</span>
            <div>
              <span className="block font-mono text-[10px] text-rose-700 font-semibold">STRESSED</span>
              <span className="font-mono text-[32px] font-bold text-rose-700">{stressedScore}</span>
            </div>
          </div>

          <div className="w-full bg-[#eceef0] h-1.5 rounded-full mt-4 overflow-hidden flex">
            <div className="bg-[#00685f] h-full" style={{ width: `${stressedScore}%` }}></div>
            <div className="bg-rose-500 h-full" style={{ width: `${scoreDrop}%` }}></div>
          </div>
          <p className="text-[12px] text-[#565e74] mt-3 leading-relaxed">
            Portfolio rating slips from Investment Grade (A-) to Vulnerable Tier (BBB- equivalent) under thermal and inundation pressure.
          </p>
        </div>

        {/* Expected Loss Card */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono uppercase text-[10px] text-[#565e74]">Expected Loss (1Y Modeled)</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
              +{elShock}% SHOCK
            </span>
          </div>

          <div className="flex items-baseline gap-4 mt-1">
            <div>
              <span className="block font-mono text-[10px] text-[#565e74]">BASE</span>
              <span className="font-mono text-[32px] font-bold text-[#0b1c30]">
                ₹14.2<span className="text-[15px] font-normal text-[#565e74] ml-1">Cr</span>
              </span>
            </div>
            <span className="material-symbols-outlined text-[#565e74] text-[20px]">arrow_forward</span>
            <div>
              <span className="block font-mono text-[10px] text-rose-700 font-semibold">STRESSED</span>
              <span className="font-mono text-[32px] font-bold text-rose-700">
                ₹{stressedEl}<span className="text-[15px] font-normal text-rose-700 ml-1">Cr</span>
              </span>
            </div>
          </div>

          <div className="w-full bg-[#eceef0] h-1.5 rounded-full mt-4 overflow-hidden flex">
            <div className="bg-[#565e74] h-full" style={{ width: '36%' }}></div>
            <div className="bg-rose-500 h-full" style={{ width: '64%' }}></div>
          </div>
          <p className="text-[12px] text-[#565e74] mt-3 leading-relaxed">
            Absolute credit impairment increases by <span className="font-mono font-bold text-[#0b1c30]">₹{(Number(stressedEl) - 14.2).toFixed(1)} Cr</span> driven predominantly by localized collateral devaluation.
          </p>
        </div>

        {/* Default Rate Card */}
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono uppercase text-[10px] text-[#565e74]">Stressed Probability of Default</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 border border-rose-200 font-bold">
              +{pdDeltaBps} BPS
            </span>
          </div>

          <div className="flex items-baseline gap-4 mt-1">
            <div>
              <span className="block font-mono text-[10px] text-[#565e74]">BASE (PD)</span>
              <span className="font-mono text-[32px] font-bold text-[#0b1c30]">2.10%</span>
            </div>
            <span className="material-symbols-outlined text-[#565e74] text-[20px]">arrow_forward</span>
            <div>
              <span className="block font-mono text-[10px] text-rose-700 font-semibold">STRESSED (PD)</span>
              <span className="font-mono text-[32px] font-bold text-rose-700">{stressedPd}%</span>
            </div>
          </div>

          <div className="w-full bg-[#eceef0] h-1.5 rounded-full mt-4 overflow-hidden flex">
            <div className="bg-[#00685f] h-full" style={{ width: '38%' }}></div>
            <div className="bg-rose-500 h-full" style={{ width: '62%' }}></div>
          </div>
          <p className="text-[12px] text-[#565e74] mt-3 leading-relaxed">
            Exceeds internal risk threshold of 4.25%. Triggers mandatory Basel III Supervisory Review capital buffer elevation.
          </p>
        </div>
      </section>

      {/* Deep Analytical Breakdown: Sector Migration + Geographic Concentration Shifts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sector Vulnerability Migration Chart */}
        <section className="lg:col-span-7 bg-white border border-[#bcc9c6]/30 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[#eceef0] mb-4">
            <div>
              <h2 className="font-semibold text-[15px] text-[#0b1c30]">Sector Vulnerability Migration (PD Delta)</h2>
              <p className="text-[12px] text-[#565e74] mt-0.5">Asset-level baseline default probability vs post-stress migration</p>
            </div>
            <div className="flex items-center gap-3 text-[11px] font-mono">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-[#bec6e0]"></span>
                <span className="text-[#565e74]">BASE PD</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded bg-rose-600"></span>
                <span className="text-[#565e74]">STRESSED PD</span>
              </div>
            </div>
          </div>

          {/* Sector Bars */}
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center text-[12px] mb-1">
                <span className="font-semibold text-[#0b1c30]">Food Processing & Agri-Logistics</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#565e74]">2.8%</span>
                  <span className="material-symbols-outlined text-[#565e74] text-[12px]">trending_flat</span>
                  <span className="text-rose-700 font-bold">7.6% (+480 bps)</span>
                </div>
              </div>
              <div className="w-full bg-[#f2f4f6] h-4 rounded-md overflow-hidden flex p-0.5 border border-[#bcc9c6]/30">
                <div className="bg-[#bec6e0] rounded-sm h-full" style={{ width: '28%' }}></div>
                <div className="bg-rose-600 rounded-sm h-full ml-1" style={{ width: '48%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[12px] mb-1">
                <span className="font-semibold text-[#0b1c30]">Textiles & Synthetic Apparel</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#565e74]">2.3%</span>
                  <span className="material-symbols-outlined text-[#565e74] text-[12px]">trending_flat</span>
                  <span className="text-rose-700 font-bold">6.2% (+390 bps)</span>
                </div>
              </div>
              <div className="w-full bg-[#f2f4f6] h-4 rounded-md overflow-hidden flex p-0.5 border border-[#bcc9c6]/30">
                <div className="bg-[#bec6e0] rounded-sm h-full" style={{ width: '23%' }}></div>
                <div className="bg-rose-600 rounded-sm h-full ml-1" style={{ width: '39%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[12px] mb-1">
                <span className="font-semibold text-[#0b1c30]">Cold Storage Infrastructure</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#565e74]">1.9%</span>
                  <span className="material-symbols-outlined text-[#565e74] text-[12px]">trending_flat</span>
                  <span className="text-rose-700 font-bold">5.8% (+390 bps)</span>
                </div>
              </div>
              <div className="w-full bg-[#f2f4f6] h-4 rounded-md overflow-hidden flex p-0.5 border border-[#bcc9c6]/30">
                <div className="bg-[#bec6e0] rounded-sm h-full" style={{ width: '19%' }}></div>
                <div className="bg-rose-600 rounded-sm h-full ml-1" style={{ width: '39%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[12px] mb-1">
                <span className="font-semibold text-[#0b1c30]">Auto Components & Precision Forging</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#565e74]">1.8%</span>
                  <span className="material-symbols-outlined text-[#565e74] text-[12px]">trending_flat</span>
                  <span className="text-rose-700 font-bold">4.4% (+260 bps)</span>
                </div>
              </div>
              <div className="w-full bg-[#f2f4f6] h-4 rounded-md overflow-hidden flex p-0.5 border border-[#bcc9c6]/30">
                <div className="bg-[#bec6e0] rounded-sm h-full" style={{ width: '18%' }}></div>
                <div className="bg-rose-600 rounded-sm h-full ml-1" style={{ width: '26%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center text-[12px] mb-1">
                <span className="font-semibold text-[#0b1c30]">Agriculture & Commercial Cash Crops</span>
                <div className="flex items-center gap-2 font-mono">
                  <span className="text-[#565e74]">3.4%</span>
                  <span className="material-symbols-outlined text-[#565e74] text-[12px]">trending_flat</span>
                  <span className="text-rose-700 font-bold">8.9% (+550 bps)</span>
                </div>
              </div>
              <div className="w-full bg-[#f2f4f6] h-4 rounded-md overflow-hidden flex p-0.5 border border-[#bcc9c6]/30">
                <div className="bg-[#bec6e0] rounded-sm h-full" style={{ width: '34%' }}></div>
                <div className="bg-rose-600 rounded-sm h-full ml-1" style={{ width: '55%' }}></div>
              </div>
            </div>
          </div>

          <div className="mt-5 p-3 bg-[#f8f9ff] rounded-lg border border-[#bcc9c6]/30 flex items-center justify-between text-[12px]">
            <span className="text-[#565e74]">
              Agricultural cash crops display highest nonlinear sensitivity to compound heat-drought duration.
            </span>
            <span className="font-mono text-[11px] text-[#00685f] font-semibold hover:underline cursor-pointer">
              Sector Diagnostics →
            </span>
          </div>
        </section>

        {/* Geographic Concentration Shifts */}
        <section className="lg:col-span-5 bg-white border border-[#bcc9c6]/30 rounded-xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#eceef0] mb-3">
              <div>
                <h2 className="font-semibold text-[15px] text-[#0b1c30]">Geographic Concentration Shifts</h2>
                <p className="text-[12px] text-[#565e74] mt-0.5">Top 5 regional credit clusters under extreme stress</p>
              </div>
              <span className="material-symbols-outlined text-[#565e74]">explore</span>
            </div>

            <div className="overflow-hidden">
              <table className="w-full text-left text-[12px]">
                <thead>
                  <tr className="border-b border-[#eceef0] font-mono text-[10px] text-[#565e74] uppercase">
                    <th className="pb-2 font-medium">Cluster / Region</th>
                    <th className="pb-2 font-medium">Primary Risk</th>
                    <th className="pb-2 font-medium text-right">Exposure</th>
                    <th className="pb-2 font-medium text-right">Migration</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#eceef0]">
                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-[#0b1c30]">Pune Industrial Hub</div>
                      <div className="text-[10px] text-[#565e74]">Western Ghats Basin</div>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-rose-100 text-rose-800 font-semibold">
                        Urban Flash Flood
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-[#0b1c30]">₹184 Cr</td>
                    <td className="py-2.5 text-right font-mono text-rose-700 font-bold">+18.4%</td>
                  </tr>

                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-[#0b1c30]">Surat Coastal Cluster</div>
                      <div className="text-[10px] text-[#565e74]">Tapi Estuary</div>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-rose-100 text-rose-800 font-semibold">
                        Storm Surge
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-[#0b1c30]">₹240 Cr</td>
                    <td className="py-2.5 text-right font-mono text-rose-700 font-bold">+22.1%</td>
                  </tr>

                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-[#0b1c30]">Bharuch Petrochem</div>
                      <div className="text-[10px] text-[#565e74]">Narmada Estuary</div>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#f2f4f6] text-[#0b1c30]">
                        Inundation / Heat
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-[#0b1c30]">₹112 Cr</td>
                    <td className="py-2.5 text-right font-mono text-rose-700 font-bold">+14.7%</td>
                  </tr>

                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-[#0b1c30]">Krishna Delta Agri</div>
                      <div className="text-[10px] text-[#565e74]">Andhra Coastal Belt</div>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-rose-100 text-rose-800 font-semibold">
                        Cyclonic / Salinity
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-[#0b1c30]">₹95 Cr</td>
                    <td className="py-2.5 text-right font-mono text-rose-700 font-bold">+29.5%</td>
                  </tr>

                  <tr className="hover:bg-[#f8f9ff] transition-colors">
                    <td className="py-2.5">
                      <div className="font-semibold text-[#0b1c30]">Guwahati Logistics</div>
                      <div className="text-[10px] text-[#565e74]">Brahmaputra Valley</div>
                    </td>
                    <td className="py-2.5">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#f2f4f6] text-[#0b1c30]">
                        Riverine Flood
                      </span>
                    </td>
                    <td className="py-2.5 text-right font-mono font-medium text-[#0b1c30]">₹64 Cr</td>
                    <td className="py-2.5 text-right font-mono text-rose-700 font-bold">+11.8%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="pt-3 border-t border-[#eceef0] flex items-center justify-between font-mono text-[11px] text-[#565e74]">
            <span>AGGREGATE STRESSED PORTFOLIO: ₹695 CR</span>
            <button
              type="button"
              onClick={onNavigateToMap}
              className="text-[#00685f] hover:underline flex items-center gap-1 font-semibold"
            >
              <span>Open Basin GIS Map</span>
              <span className="material-symbols-outlined text-[13px]">open_in_new</span>
            </button>
          </div>
        </section>
      </div>

      {/* Capital Adequacy & Buffer Impact Summary Box */}
      <section className="bg-white border border-[#bcc9c6]/30 rounded-xl p-6 shadow-xs">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4 max-w-2xl">
            <div className="w-12 h-12 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center shrink-0 border border-rose-200">
              <span className="material-symbols-outlined text-[26px]">account_balance</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[16px] text-[#0b1c30]">Capital Adequacy & Buffer Impact Analysis</h3>
                <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] bg-rose-100 text-rose-800 font-bold border border-rose-200">
                  CAPITAL CALL WARNING
                </span>
              </div>
              <p className="text-[13px] text-[#565e74] mt-1 leading-relaxed">
                Under the simulated <span className="font-semibold text-[#0b1c30]">{pathway} ({timeHorizon})</span> shock, Tier-1 Common Equity (CET1) drops from <span className="font-mono font-semibold text-[#0b1c30]">14.8%</span> to <span className="font-mono font-bold text-rose-700">{cet1Stressed}%</span>, eroding <span className="font-mono font-semibold text-[#0b1c30]">{((14.8 - Number(cet1Stressed)) * 100).toFixed(0)} bps</span> of regulatory buffer. Additional provisioning requirement calculated at <span className="font-mono font-bold text-rose-700">₹{reqProvision} Cr</span> to restore capital conservation thresholds.
              </p>
            </div>
          </div>

          {/* Quantitative Metrics + Action */}
          <div className="flex flex-col sm:flex-row items-center gap-5 w-full lg:w-auto shrink-0 border-t lg:border-t-0 lg:border-l border-[#bcc9c6]/30 pt-4 lg:pt-0 lg:pl-6">
            <div className="grid grid-cols-2 gap-3 w-full sm:w-auto text-left">
              <div className="bg-[#f2f4f6] px-3.5 py-2 rounded-lg border border-[#bcc9c6]/30">
                <span className="block font-mono text-[10px] text-[#565e74] uppercase">CET1 RATIO</span>
                <span className="font-mono text-[14px] font-medium text-[#0b1c30]">
                  14.8% → <span className="text-rose-700 font-bold">{cet1Stressed}%</span>
                </span>
              </div>
              <div className="bg-[#f2f4f6] px-3.5 py-2 rounded-lg border border-[#bcc9c6]/30">
                <span className="block font-mono text-[10px] text-[#565e74] uppercase">REQ. PROVISION</span>
                <span className="font-mono text-[14px] font-bold text-rose-700">+₹{reqProvision} Cr</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                type="button"
                onClick={onExportReport}
                className="flex-1 sm:flex-none h-10 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs active:scale-98"
              >
                <span className="material-symbols-outlined text-[17px]">download_for_offline</span>
                <span>Export Stress Report</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
