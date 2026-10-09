import React from 'react';
import { TabType } from '../types';

interface SideNavBarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  alertCount?: number;
}

export function SideNavBar({ activeTab, onTabChange, alertCount = 31 }: SideNavBarProps) {
  const navItems: { id: TabType; label: string; icon: string; badge?: string | number; live?: boolean }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'map', label: 'Map Explorer', icon: 'map', live: true },
    { id: 'borrowers', label: 'Borrowers', icon: 'business_center' },
    { id: 'alerts', label: 'Alerts', icon: 'notifications_active', badge: alertCount },
    { id: 'scenarios', label: 'Scenarios', icon: 'tune' },
    { id: 'portfolio', label: 'Portfolio', icon: 'pie_chart' },
    { id: 'reports', label: 'Reports', icon: 'description' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 z-40 flex flex-col justify-between py-4 px-3 w-64 bg-white border-r border-[#bcc9c6]/30 text-[#0b1c30] select-none">
      <div className="flex flex-col gap-5">
        {/* Brand Anchor */}
        <div 
          onClick={() => onTabChange('landing')}
          className="flex items-center gap-3 px-3 py-1 cursor-pointer hover:opacity-90 transition-opacity"
          title="Click to view Public Institutional Landing"
        >
          <div className="w-8 h-8 rounded-lg bg-[#00685f] flex items-center justify-center text-white shadow-xs">
            <span className="material-symbols-outlined text-[20px]" data-weight="fill">cloud_sync</span>
          </div>
          <div>
            <div className="text-[17px] font-bold tracking-tight text-[#0b1c30] leading-none">Climoid</div>
            <div className="text-[11px] font-mono text-[#6d7a77] mt-0.5">MSME Credit Engine</div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`flex items-center justify-between px-3 py-2 text-[13px] font-medium rounded-lg transition-all text-left ${
                  isActive
                    ? 'bg-[#e5eeff] text-[#00685f] font-semibold border-l-2 border-[#00685f]'
                    : 'text-[#3d4947] hover:bg-[#f2f4f6] hover:text-[#0b1c30]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span 
                    className="material-symbols-outlined text-[19px]"
                    data-weight={isActive ? "fill" : undefined}
                  >
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5">
                  {item.live && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#89f5e7]/40 text-[#005049] font-semibold">
                      LIVE
                    </span>
                  )}
                  {item.badge && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 font-bold border border-rose-200">
                      {item.badge}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </nav>
      </div>

      {/* SideNav Footer */}
      <div className="flex flex-col gap-1 pt-3 border-t border-[#bcc9c6]/30 text-[12px]">
        <div 
          onClick={() => onTabChange('landing')}
          className="flex items-center justify-between px-3 py-2 text-[#3d4947] hover:bg-[#f2f4f6] rounded-lg transition-colors cursor-pointer"
          title="Switch to Public Overview & Login"
        >
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[17px]">public</span>
            <span>Public Portal</span>
          </div>
          <span className="text-[10px] font-mono text-[#00685f]">Sign In/Out →</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 text-[#3d4947] hover:bg-[#f2f4f6] rounded-lg transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[17px]">shield_person</span>
            <span>Lender Role</span>
          </div>
          <span className="text-[11px] font-mono text-[#6d7a77]">Tier 1 UW</span>
        </div>

        <div className="flex items-center justify-between px-3 py-2 text-[#3d4947] hover:bg-[#f2f4f6] rounded-lg transition-colors">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[17px]">sensors</span>
            <span>API Status</span>
          </div>
          <span className="text-[11px] font-mono text-[#00685f] font-semibold">99.98% OK</span>
        </div>
      </div>
    </aside>
  );
}
