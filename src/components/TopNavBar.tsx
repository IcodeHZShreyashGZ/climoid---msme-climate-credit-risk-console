import React, { useState } from 'react';
import { TabType, TimeHorizon } from '../types';

interface TopNavBarProps {
  activeTab: TabType;
  horizon: TimeHorizon;
  onHorizonChange: (h: TimeHorizon) => void;
  onExportClick: () => void;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
  defaultSearchValue?: string;
}

export function TopNavBar({
  activeTab,
  horizon,
  onHorizonChange,
  onExportClick,
  onSearch,
  searchPlaceholder = 'Search facilities, GSTIN, coordinates...',
  defaultSearchValue = ''
}: TopNavBarProps) {
  const [searchValue, setSearchValue] = useState(defaultSearchValue);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  const getBreadcrumbTitle = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Climoid Risk Console';
      case 'map':
        return 'Map Explorer GIS Workbench';
      case 'borrowers':
        return 'Borrower Underwriting Console';
      case 'alerts':
        return 'Alerts & Early Intervention';
      case 'scenarios':
        return 'Scenario Stress-Testing';
      case 'portfolio':
        return 'Portfolio Climate Analytics';
      case 'reports':
        return 'Compliance & Pillar 3 Reports';
      case 'settings':
        return 'Model Parameters & Policies';
      default:
        return 'Climoid Risk Console';
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    if (onSearch) onSearch(val);
  };

  return (
    <header className="fixed top-0 left-64 right-0 h-14 bg-white z-30 border-b border-[#bcc9c6]/30 flex items-center justify-between px-6 select-none">
      {/* Left: Product breadcrumb & Search */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[15px] font-bold text-[#0b1c30] tracking-tight">{getBreadcrumbTitle()}</span>
          <span className="text-[#bcc9c6]">/</span>
        </div>

        <div className="relative flex items-center w-72">
          <span className="material-symbols-outlined text-[#6d7a77] absolute left-2.5 text-[17px] pointer-events-none">search</span>
          <input
            type="text"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className="w-full h-8 pl-8 pr-3 text-[13px] bg-white border border-[#bcc9c6]/40 rounded-lg focus:outline-none focus:border-[#00685f] focus:ring-1 focus:ring-[#00685f] text-[#0b1c30] placeholder:text-[#6d7a77]"
          />
        </div>
      </div>

      {/* Navigation links & Trailing actions */}
      <div className="flex items-center gap-3">
        {/* Temporal Horizon Segment Tabs */}
        <div className="flex items-center gap-1 bg-[#f2f4f6] p-0.5 rounded-lg border border-[#bcc9c6]/30">
          {(['now', '7day', '90day', '2050'] as TimeHorizon[]).map((h) => {
            const labels: Record<TimeHorizon, string> = {
              now: 'Now',
              '7day': '7-Day',
              '90day': '90-Day',
              '2050': '2050'
            };
            const isSelected = horizon === h;
            return (
              <button
                key={h}
                type="button"
                onClick={() => onHorizonChange(h)}
                className={`px-2.5 py-1 text-[12px] font-mono font-medium rounded-md transition-all ${
                  isSelected
                    ? 'bg-[#00685f] text-white shadow-xs'
                    : 'text-[#565e74] hover:text-[#0b1c30] hover:bg-white/60'
                }`}
              >
                {labels[h]}
              </button>
            );
          })}
        </div>

        <div className="h-5 w-px bg-[#bcc9c6]/40 mx-0.5"></div>

        {/* Export Risk Pack Primary CTA */}
        <button
          type="button"
          onClick={onExportClick}
          className="h-8 px-3 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-medium flex items-center gap-1.5 transition-colors shadow-xs active:scale-98"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>Export Risk Pack</span>
        </button>

        {/* Notifications Icon Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#565e74] hover:bg-[#f2f4f6] hover:text-[#0b1c30] transition-colors relative"
            title="Notifications"
          >
            <span className="material-symbols-outlined text-[19px]">notifications</span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-white rounded-xl border border-[#bcc9c6]/50 shadow-lg p-3 z-50 text-[12px]">
              <div className="flex items-center justify-between pb-2 border-b border-[#eceef0]">
                <span className="font-semibold text-[#0b1c30]">Underwriting Feed</span>
                <span className="text-[10px] font-mono text-[#00685f]">Live Nowcast</span>
              </div>
              <div className="py-2 space-y-2 text-[#565e74]">
                <div className="p-2 rounded bg-rose-50 border border-rose-200 text-rose-900">
                  <span className="font-semibold block">Mutha Basin Flood Warning</span>
                  <span>IMD orange alert: &gt;115mm in next 48h. 37 borrowers exposed.</span>
                </div>
                <div className="p-2 rounded bg-amber-50 border border-amber-200 text-amber-900">
                  <span className="font-semibold block">Vidarbha Heatwave Peak</span>
                  <span>44.5°C threshold crossed; cold chain units on standby.</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Help button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowHelp(!showHelp)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#565e74] hover:bg-[#f2f4f6] hover:text-[#0b1c30] transition-colors"
            title="Methodology Docs"
          >
            <span className="material-symbols-outlined text-[19px]">help</span>
          </button>

          {showHelp && (
            <div className="absolute right-0 top-10 w-72 bg-white rounded-xl border border-[#bcc9c6]/50 shadow-lg p-3 z-50 text-[12px]">
              <div className="font-semibold text-[#0b1c30] pb-1 border-b border-[#eceef0]">Climoid Actuarial Engine</div>
              <p className="py-2 text-[#565e74] leading-relaxed">
                Incorporates ECMWF ERA5+ reanalysis, Sentinel-2 10m hydrology grids, and NGFS Phase IV scenario curves compliant with RBI Climate Directive 2024.
              </p>
            </div>
          )}
        </div>

        {/* User avatar & info */}
        <div className="flex items-center gap-2 pl-1 border-l border-[#bcc9c6]/30">
          <div className="w-7 h-7 rounded-full bg-[#89f5e7]/50 text-[#005049] flex items-center justify-center font-mono text-[11px] font-bold border border-[#bcc9c6]/40">
            UW
          </div>
          <div className="hidden xl:block text-left leading-tight">
            <span className="block text-[12px] font-semibold text-[#0b1c30]">A. Kulkarni</span>
            <span className="block text-[10px] font-mono text-[#6d7a77]">Sr. Risk Underwriter</span>
          </div>
        </div>
      </div>
    </header>
  );
}
