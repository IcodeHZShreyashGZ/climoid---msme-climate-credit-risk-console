import React, { useState } from 'react';

interface ReportsViewProps {
  onExportPack: () => void;
}

export function ReportsView({ onExportPack }: ReportsViewProps) {
  const [downloadedReport, setDownloadedReport] = useState<string | null>(null);

  const reports = [
    {
      title: 'RBI Master Direction Climate Disclosure Pack (Pillar 3)',
      date: 'Generated: 31-DEC-2024',
      size: '4.8 MB',
      type: 'XBRL / PDF',
      status: 'Audited & Signed',
      icon: 'verified'
    },
    {
      title: 'TCFD Physical Catastrophe Exposure & Revenue-at-Risk Schedule',
      date: 'Generated: Q4 Final',
      size: '2.1 MB',
      type: 'PDF / Tape',
      status: 'Current Cycle',
      icon: 'description'
    },
    {
      title: 'NGFS Scenario Stress-Test Capital Adequacy Impact Assessment',
      date: 'Simulation #4092-B',
      size: '6.4 MB',
      type: 'Executive Dossier',
      status: 'Basel III Compliant',
      icon: 'analytics'
    },
    {
      title: 'SEBI BRSR Core Value Chain Physical Hazard Telemetry Schedule',
      date: 'FY 2024-25',
      size: '3.3 MB',
      type: 'Spreadsheet Pack',
      status: 'Submitted',
      icon: 'table_chart'
    }
  ];

  const handleDownload = (title: string) => {
    setDownloadedReport(title);
    setTimeout(() => setDownloadedReport(null), 3000);
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1536px] mx-auto select-none">
      {downloadedReport && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-[13px] text-emerald-900 flex items-center gap-2 shadow-xs animate-in fade-in duration-150">
          <span className="material-symbols-outlined text-emerald-700 text-[18px]">download_done</span>
          <span>Downloaded: <strong>{downloadedReport}</strong></span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-[22px] font-bold text-[#0b1c30] tracking-tight">Compliance & Regulatory Reports</h1>
          <p className="text-[13px] text-[#565e74]">
            Export certified supervisory disclosure packs aligned with RBI, SEBI, and TCFD mandates
          </p>
        </div>

        <button
          type="button"
          onClick={onExportPack}
          className="h-9 px-4 rounded-lg bg-[#00685f] hover:bg-[#008378] text-white text-[12px] font-semibold flex items-center gap-2 transition-colors shadow-xs"
        >
          <span className="material-symbols-outlined text-[16px]">file_download</span>
          <span>Export Full Risk Pack</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map((report, idx) => (
          <div key={idx} className="bg-white border border-[#bcc9c6]/30 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#f2f4f6] text-[#00685f] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-[20px]">{report.icon}</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded border border-emerald-200 font-semibold">
                    {report.status}
                  </span>
                  <span className="font-mono text-[10px] text-[#565e74]">{report.size}</span>
                </div>
                <h3 className="font-semibold text-[14px] text-[#0b1c30]">{report.title}</h3>
                <p className="text-[12px] text-[#565e74] mt-1">{report.date} • Format: {report.type}</p>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[#eceef0] flex items-center justify-between">
              <span className="font-mono text-[11px] text-[#565e74]">SHA256: 8f9b...110e</span>
              <button
                type="button"
                onClick={() => handleDownload(report.title)}
                className="text-[12px] font-semibold text-[#00685f] hover:underline flex items-center gap-1"
              >
                <span>Download Report</span>
                <span className="material-symbols-outlined text-[15px]">download</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
