import React, { useState } from 'react';

export function SettingsView() {
  const [thresholdCeiling, setThresholdCeiling] = useState('65.0');
  const [spreadCapBps, setSpreadCapBps] = useState('150');
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);
  const [satelliteResolution, setSatelliteResolution] = useState('10m');
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1000px] mx-auto select-none">
      {saved && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-900 flex items-center gap-2 shadow-xs animate-in fade-in duration-150">
          <span className="material-symbols-outlined text-emerald-700 text-[18px]">check_circle</span>
          <span>Risk parameters and policy triggers saved successfully.</span>
        </div>
      )}

      <div className="pb-1">
        <h1 className="text-[22px] font-bold text-[#0b1c30] tracking-tight">Model Parameters & Underwriting Policy</h1>
        <p className="text-[13px] text-[#565e74]">
          Configure institutional tolerances, climate haircut caps, and automated RM intervention rules
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-semibold text-[15px] text-[#0b1c30] border-b border-[#eceef0] pb-2">
            Actuarial Risk Score Thresholds
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-[13px]">
            <div>
              <label className="block font-mono text-[10px] text-[#565e74] uppercase tracking-wider mb-1">
                Portfolio Climate Risk Threshold Ceiling
              </label>
              <input
                type="text"
                value={thresholdCeiling}
                onChange={(e) => setThresholdCeiling(e.target.value)}
                className="w-full h-9 px-3 bg-[#f8f9ff] border border-[#bcc9c6]/40 rounded-lg text-[#0b1c30] font-mono focus:border-[#00685f] focus:outline-none"
              />
              <span className="text-[11px] text-[#565e74] mt-1 block">Score trigger for mandatory Basel III capital buffer elevation.</span>
            </div>

            <div>
              <label className="block font-mono text-[10px] text-[#565e74] uppercase tracking-wider mb-1">
                Max Climate Risk Premium Spread Cap (bps)
              </label>
              <input
                type="text"
                value={spreadCapBps}
                onChange={(e) => setSpreadCapBps(e.target.value)}
                className="w-full h-9 px-3 bg-[#f8f9ff] border border-[#bcc9c6]/40 rounded-lg text-[#0b1c30] font-mono focus:border-[#00685f] focus:outline-none"
              />
              <span className="text-[11px] text-[#565e74] mt-1 block">Maximum spread haircut that can be passed to borrower interest coupon.</span>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#bcc9c6]/30 rounded-xl p-6 shadow-xs space-y-4">
          <h2 className="font-semibold text-[15px] text-[#0b1c30] border-b border-[#eceef0] pb-2">
            Telemetry & Telemetry Feeds
          </h2>

          <div className="space-y-3 text-[13px]">
            <div className="flex items-center justify-between p-3 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
              <div>
                <span className="font-semibold text-[#0b1c30] block">Automated RM Intervention Dispatch</span>
                <span className="text-[12px] text-[#565e74]">Automatically dispatch alerts when IMD predicts &gt;100mm/24h or &gt;42°C in borrower PIN code.</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoSmsEnabled}
                  onChange={(e) => setAutoSmsEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-[#d8dadc] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#00685f]"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg border border-[#bcc9c6]/30 bg-[#f8f9ff]">
              <div>
                <span className="font-semibold text-[#0b1c30] block">Sentinel-2 Surface Resolution</span>
                <span className="text-[12px] text-[#565e74]">Orbital multispectral imagery fidelity used for micro-elevation hydrology.</span>
              </div>
              <select
                value={satelliteResolution}
                onChange={(e) => setSatelliteResolution(e.target.value)}
                className="h-8 px-3 rounded-lg border border-[#bcc9c6]/40 bg-white font-mono text-[12px]"
              >
                <option value="10m">10-meter (Standard Multi-spectral)</option>
                <option value="5m">5-meter (Super-Resolution Ensembled)</option>
              </select>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold transition-colors shadow-xs"
          >
            Save Configuration
          </button>
        </div>
      </form>
    </div>
  );
}
