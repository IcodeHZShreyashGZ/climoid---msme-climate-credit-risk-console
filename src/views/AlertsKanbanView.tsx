import React, { useState } from 'react';
import { ClimateAlertItem } from '../types';
import { INITIAL_ALERTS } from '../data/mockData';

interface AlertsKanbanViewProps {
  onOpenBulkNotify: () => void;
  onNavigateToScenarios: () => void;
}

export function AlertsKanbanView({ onOpenBulkNotify, onNavigateToScenarios }: AlertsKanbanViewProps) {
  const [alerts, setAlerts] = useState<ClimateAlertItem[]>(INITIAL_ALERTS);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [searchFilter, setSearchFilter] = useState('');

  const handleCardAction = (alert: ClimateAlertItem) => {
    if (alert.column === 'new') {
      // Move to review or action
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, column: 'review', assignedLead: 'A. Kulkarni (Underwriter)' } : a));
      setActionMessage(`Action triggered for ${alert.title}: Assigned to review queue.`);
    } else if (alert.column === 'review') {
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, column: 'action', actionTakenChips: ['Covenant Mandated', 'RM Field Alert'] } : a));
      setActionMessage(`Review approved for ${alert.title}: Moved to executed covenants.`);
    } else if (alert.column === 'action') {
      setAlerts(prev => prev.map(a => a.id === alert.id ? { ...a, column: 'resolved', statusNotes: 'Field verification confirmed mitigation completed.' } : a));
      setActionMessage(`Action verified for ${alert.title}: Archived as mitigated.`);
    } else {
      setActionMessage(`Archival record downloaded for ${alert.title}.`);
    }

    setTimeout(() => {
      setActionMessage(null);
    }, 3500);
  };

  const filteredAlerts = alerts.filter(a => 
    a.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.description.toLowerCase().includes(searchFilter.toLowerCase()) ||
    a.category.toLowerCase().includes(searchFilter.toLowerCase())
  );

  const newAlerts = filteredAlerts.filter(a => a.column === 'new');
  const reviewAlerts = filteredAlerts.filter(a => a.column === 'review');
  const actionAlerts = filteredAlerts.filter(a => a.column === 'action');
  const resolvedAlerts = filteredAlerts.filter(a => a.column === 'resolved');

  return (
    <div className="flex flex-col h-[calc(100vh-56px)] select-none">
      {/* Toast feedback */}
      {actionMessage && (
        <div className="mb-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-900 flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-700 text-[18px]">task_alt</span>
            <span>{actionMessage}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-emerald-700 hover:text-emerald-900 text-xs font-semibold">
            Dismiss
          </button>
        </div>
      )}

      {/* Subheader / Alerts Overview Ribbon */}
      <section className="bg-white border-b border-[#bcc9c6]/30 px-6 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0 rounded-xl mb-4 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-[20px] font-bold text-[#0b1c30] tracking-tight">Alerts & Early Intervention</h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded font-mono text-[10px] bg-[#f2f4f6] text-[#565e74] font-semibold">
              LIVE ACTUARIAL FEED
            </span>
          </div>
          <p className="text-[12px] text-[#565e74] mt-0.5">
            Automated stress detection across credit books subject to severe physical climate anomalies.
          </p>
        </div>

        {/* Alert Volume Metrics & Primary CTA */}
        <div className="flex items-center gap-4 flex-wrap">
          {/* Metric Strip */}
          <div className="flex items-center gap-4 border border-[#bcc9c6]/40 bg-[#f2f4f6] px-3.5 py-1.5 rounded-lg text-[12px]">
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#565e74]">Active:</span>
              <span className="font-mono text-[14px] font-bold text-rose-700">31</span>
            </div>
            <div className="h-3 w-px bg-[#bcc9c6]/40"></div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#565e74]">Actioned Today:</span>
              <span className="font-mono text-[14px] font-bold text-[#00685f]">14</span>
            </div>
            <div className="h-3 w-px bg-[#bcc9c6]/40"></div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-[#565e74]">Under Review:</span>
              <span className="font-mono text-[14px] font-bold text-[#006194]">9</span>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={onOpenBulkNotify}
            className="bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-semibold px-3.5 py-2 rounded-lg flex items-center gap-2 transition-colors shadow-xs active:scale-98"
          >
            <span className="material-symbols-outlined text-[17px]">send</span>
            <span>Bulk Notify Relationship Managers</span>
          </button>
        </div>
      </section>

      {/* ================= KANBAN INTERVENTION BOARD ================= */}
      <div className="flex-1 overflow-x-auto pb-4">
        <div className="grid grid-cols-4 gap-4 h-full min-w-[1180px]">
          {/* ================= COLUMN 1: NEW ALERTS ================= */}
          <section className="flex flex-col h-full bg-white border border-[#bcc9c6]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#f8f9ff] border-b border-[#bcc9c6]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span>
                <h2 className="font-semibold text-[14px] text-[#0b1c30]">New Alerts</h2>
              </div>
              <span className="font-mono text-[10px] bg-white border border-[#bcc9c6]/40 px-2 py-0.5 rounded text-[#565e74] font-semibold">
                {newAlerts.length} PENDING
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scroll">
              {newAlerts.map(alert => (
                <article key={alert.id} className="p-3.5 bg-white border border-[#bcc9c6]/40 rounded-lg hover:border-[#00685f] transition-all flex flex-col gap-2.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-[#f2f4f6] text-[#006194]">
                        <span className="material-symbols-outlined text-[16px]">water_drop</span>
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded font-mono text-[10px] bg-rose-100 text-rose-800 font-bold uppercase border border-rose-200">
                        {alert.severity}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#565e74] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">timer</span> {alert.timeWindow || alert.timeAgo}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[13px] text-[#0b1c30] leading-snug">{alert.title}</h3>
                    <p className="text-[12px] text-[#565e74] mt-0.5">{alert.description}</p>
                  </div>

                  <div className="flex items-baseline justify-between pt-1 border-t border-[#eceef0]">
                    <span className="text-[11px] text-[#565e74]">Exposure At Risk:</span>
                    <span className="font-mono text-[14px] font-bold text-[#0b1c30]">₹{alert.exposureAtRiskCr.toFixed(1)} Cr</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCardAction(alert)}
                    className="w-full mt-1 py-1.5 px-3 bg-[#f2f4f6] hover:bg-[#e5eeff] text-[#00685f] font-semibold text-[12px] rounded-lg border border-[#bcc9c6]/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">{alert.actionIcon}</span>
                    <span>{alert.recommendedAction}</span>
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* ================= COLUMN 2: UNDER REVIEW ================= */}
          <section className="flex flex-col h-full bg-white border border-[#bcc9c6]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#f8f9ff] border-b border-[#bcc9c6]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#006194]"></span>
                <h2 className="font-semibold text-[14px] text-[#0b1c30]">Under Review</h2>
              </div>
              <span className="font-mono text-[10px] bg-white border border-[#bcc9c6]/40 px-2 py-0.5 rounded text-[#565e74] font-semibold">
                {reviewAlerts.length} ACTIVE
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scroll">
              {reviewAlerts.map(alert => (
                <article key={alert.id} className="p-3.5 bg-white border border-[#bcc9c6]/40 rounded-lg hover:border-[#006194] transition-all flex flex-col gap-2.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-[#f2f4f6] text-[#006194]">
                        <span className="material-symbols-outlined text-[16px]">analytics</span>
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded font-mono text-[10px] bg-blue-100 text-blue-900 font-bold uppercase border border-blue-200">
                        {alert.severity}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#565e74] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">history</span> {alert.timeAgo}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[13px] text-[#0b1c30] leading-snug">{alert.title}</h3>
                    <p className="text-[12px] text-[#565e74] mt-0.5">{alert.description}</p>
                  </div>

                  {alert.assignedLead && (
                    <div className="bg-[#f2f4f6] p-2 rounded text-[11px] flex items-center justify-between">
                      <span className="text-[#565e74]">Assigned Lead:</span>
                      <span className="font-semibold text-[#0b1c30] flex items-center gap-1">
                        <span className="w-4 h-4 rounded-full bg-[#bcc9c6] text-[10px] text-white flex items-center justify-center font-bold">R</span>
                        {alert.assignedLead}
                      </span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-1 border-t border-[#eceef0]">
                    <span className="text-[11px] text-[#565e74]">Exposure At Risk:</span>
                    <span className="font-mono text-[14px] font-bold text-[#0b1c30]">₹{alert.exposureAtRiskCr.toFixed(1)} Cr</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCardAction(alert)}
                    className="w-full mt-1 py-1.5 px-3 bg-[#f2f4f6] hover:bg-[#e5eeff] text-[#00685f] font-semibold text-[12px] rounded-lg border border-[#bcc9c6]/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">{alert.actionIcon}</span>
                    <span>{alert.recommendedAction}</span>
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* ================= COLUMN 3: ACTION TAKEN ================= */}
          <section className="flex flex-col h-full bg-white border border-[#bcc9c6]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#f8f9ff] border-b border-[#bcc9c6]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#00685f]"></span>
                <h2 className="font-semibold text-[14px] text-[#0b1c30]">Action Taken</h2>
              </div>
              <span className="font-mono text-[10px] bg-white border border-[#bcc9c6]/40 px-2 py-0.5 rounded text-[#565e74] font-semibold">
                {actionAlerts.length} EXECUTED
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scroll">
              {actionAlerts.map(alert => (
                <article key={alert.id} className="p-3.5 bg-white border border-[#bcc9c6]/40 rounded-lg hover:border-[#00685f] transition-all flex flex-col gap-2.5 shadow-2xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-[#f2f4f6] text-[#00685f]">
                        <span className="material-symbols-outlined text-[16px]">verified</span>
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded font-mono text-[10px] bg-emerald-100 text-emerald-800 font-bold uppercase border border-emerald-200">
                        {alert.severity}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#565e74]">{alert.timeAgo}</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[13px] text-[#0b1c30] leading-snug">{alert.title}</h3>
                    <p className="text-[12px] text-[#565e74] mt-0.5">{alert.description}</p>
                  </div>

                  {alert.actionTakenChips && (
                    <div className="flex flex-wrap gap-1.5">
                      {alert.actionTakenChips.map((chip, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded font-mono text-[10px] bg-[#f2f4f6] text-[#0b1c30] flex items-center gap-1 border border-[#bcc9c6]/30 font-medium">
                          <span className="material-symbols-outlined text-[12px]">check_small</span>
                          {chip}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-1 border-t border-[#eceef0]">
                    <span className="text-[11px] text-[#565e74]">Protected Exposure:</span>
                    <span className="font-mono text-[14px] font-bold text-[#0b1c30]">₹{alert.exposureAtRiskCr.toFixed(1)} Cr</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleCardAction(alert)}
                    className="w-full mt-1 py-1.5 px-3 bg-[#f2f4f6] hover:bg-[#e5eeff] text-[#565e74] hover:text-[#0b1c30] font-medium text-[12px] rounded-lg border border-[#bcc9c6]/40 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <span className="material-symbols-outlined text-[15px]">{alert.actionIcon}</span>
                    <span>{alert.recommendedAction}</span>
                  </button>
                </article>
              ))}
            </div>
          </section>

          {/* ================= COLUMN 4: RESOLVED / MITIGATED ================= */}
          <section className="flex flex-col h-full bg-white border border-[#bcc9c6]/30 rounded-xl overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-[#f8f9ff] border-b border-[#bcc9c6]/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6d7a77]"></span>
                <h2 className="font-semibold text-[14px] text-[#0b1c30]">Resolved / Mitigated</h2>
              </div>
              <span className="font-mono text-[10px] bg-white border border-[#bcc9c6]/40 px-2 py-0.5 rounded text-[#565e74] font-semibold">
                28 THIS MONTH
              </span>
            </div>

            <div className="flex-1 p-3 overflow-y-auto space-y-3 custom-scroll">
              {resolvedAlerts.map(alert => (
                <article key={alert.id} className="p-3.5 bg-white border border-[#bcc9c6]/40 rounded-lg hover:border-[#6d7a77] transition-all flex flex-col gap-2.5 shadow-2xs opacity-95">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <span className="p-1 rounded bg-[#f2f4f6] text-[#00685f]">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      </span>
                      <span className="inline-flex px-1.5 py-0.5 rounded font-mono text-[10px] bg-[#f2f4f6] text-[#00685f] font-bold uppercase border border-[#bcc9c6]/30">
                        {alert.severity}
                      </span>
                    </div>
                    <span className="font-mono text-[10px] text-[#565e74]">{alert.timeAgo}</span>
                  </div>

                  <div>
                    <h3 className="font-semibold text-[13px] text-[#0b1c30] leading-snug">{alert.title}</h3>
                    <p className="text-[12px] text-[#565e74] mt-0.5">{alert.description}</p>
                  </div>

                  {alert.statusNotes && (
                    <div className="p-2 rounded bg-[#f8f9ff] text-[11px] text-[#565e74] flex items-start gap-1.5 border border-[#bcc9c6]/20">
                      <span className="material-symbols-outlined text-[15px] text-[#00685f] shrink-0 mt-0.5">check_circle</span>
                      <span>{alert.statusNotes}</span>
                    </div>
                  )}

                  <div className="flex items-baseline justify-between pt-1 border-t border-[#eceef0]">
                    <span className="text-[11px] text-[#565e74]">Secured Book:</span>
                    <span className="font-mono text-[14px] font-bold text-[#0b1c30]">₹{alert.exposureAtRiskCr.toFixed(1)} Cr</span>
                  </div>

                  <div className="pt-1 flex items-center justify-between text-[11px] text-[#565e74]">
                    <span className="flex items-center gap-1 font-mono text-[10px]">
                      <span className="material-symbols-outlined text-[13px]">verified</span> AUDIT LOGGED
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCardAction(alert)}
                      className="text-[#00685f] hover:underline font-mono text-[11px] font-semibold"
                    >
                      Archival Dossier →
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
