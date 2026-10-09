import React, { useState } from 'react';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetName?: string;
}

export function ExportRiskPackModal({ isOpen, onClose, targetName = 'Full MSME Portfolio' }: ExportModalProps) {
  const [format, setFormat] = useState<'pdf' | 'csv' | 'rbi'>('pdf');
  const [downloading, setDownloading] = useState(false);
  const [completed, setCompleted] = useState(false);

  if (!isOpen) return null;

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => {
      setDownloading(false);
      setCompleted(true);
      setTimeout(() => {
        setCompleted(false);
        onClose();
      }, 1400);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#ffffff] rounded-xl border border-[#bcc9c6]/50 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f]">description</span>
            <h3 className="font-semibold text-[16px] text-[#0b1c30]">Export Institutional Risk Pack</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#565e74] hover:bg-[#eceef0] transition-colors"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#565e74] block mb-1">Target Scope</span>
            <div className="p-2.5 rounded-lg bg-[#f2f4f6] border border-[#bcc9c6]/40 text-[13px] font-medium text-[#0b1c30] flex items-center justify-between">
              <span>{targetName}</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200">Audit-Verified</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#565e74] block mb-2">Export Format</span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setFormat('pdf')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === 'pdf' 
                    ? 'border-[#00685f] bg-[#00685f]/5 text-[#00685f]' 
                    : 'border-[#bcc9c6]/40 hover:bg-[#f2f4f6] text-[#0b1c30]'
                }`}
              >
                <span className="block font-semibold text-[13px]">Executive PDF</span>
                <span className="text-[11px] text-[#565e74]">Signed Credit Note + GIS maps</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('rbi')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === 'rbi' 
                    ? 'border-[#00685f] bg-[#00685f]/5 text-[#00685f]' 
                    : 'border-[#bcc9c6]/40 hover:bg-[#f2f4f6] text-[#0b1c30]'
                }`}
              >
                <span className="block font-semibold text-[13px]">RBI Pillar 3</span>
                <span className="text-[11px] text-[#565e74]">XBRL / Basel III taxonomy</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat('csv')}
                className={`p-3 rounded-lg border text-left transition-all ${
                  format === 'csv' 
                    ? 'border-[#00685f] bg-[#00685f]/5 text-[#00685f]' 
                    : 'border-[#bcc9c6]/40 hover:bg-[#f2f4f6] text-[#0b1c30]'
                }`}
              >
                <span className="block font-semibold text-[13px]">Actuarial Tape</span>
                <span className="text-[11px] text-[#565e74]">Raw CSV loan-level PD deltas</span>
              </button>
            </div>
          </div>

          <div className="bg-[#f8f9ff] p-3 rounded-lg border border-[#bcc9c6]/30 text-[12px] text-[#565e74] space-y-1">
            <div className="flex justify-between">
              <span>ECMWF Hydrological Run:</span>
              <span className="font-mono text-[#0b1c30]">2026-10-09 06Z</span>
            </div>
            <div className="flex justify-between">
              <span>Cryptographic Signature:</span>
              <span className="font-mono text-[#00685f]">SHA256: 9f8a...41bc</span>
            </div>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#f8f9ff] border-t border-[#eceef0] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-[13px] font-medium text-[#565e74] hover:text-[#0b1c30] transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDownload}
            disabled={downloading || completed}
            className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold rounded-lg flex items-center gap-1.5 transition-all shadow-xs disabled:opacity-60"
          >
            {downloading ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Generating Risk Pack...</span>
              </>
            ) : completed ? (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>Pack Ready & Saved!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">download</span>
                <span>Download Certified Pack</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface BulkNotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function BulkNotifyModal({ isOpen, onClose, onSuccess }: BulkNotifyModalProps) {
  const [selectedChannels, setSelectedChannels] = useState({
    sms: true,
    email: true,
    portal: true,
    rmCall: true
  });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  if (!isOpen) return null;

  const handleSend = () => {
    setStatus('sending');
    setTimeout(() => {
      setStatus('sent');
      setTimeout(() => {
        onSuccess();
        setStatus('idle');
        onClose();
      }, 1000);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="w-full max-w-lg bg-[#ffffff] rounded-xl border border-[#bcc9c6]/50 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="px-5 py-4 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9ff]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#00685f]">forward_to_inbox</span>
            <h3 className="font-semibold text-[16px] text-[#0b1c30]">Bulk Dispatch: RM Early Warnings</h3>
          </div>
          <button 
            onClick={onClose} 
            className="w-7 h-7 rounded-lg flex items-center justify-center text-[#565e74] hover:bg-[#eceef0]"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-[13px] text-amber-900 flex items-start gap-2">
            <span className="material-symbols-outlined text-amber-700 text-[18px] shrink-0 mt-0.5">warning</span>
            <div>
              <span className="font-semibold block">31 Active Climate Anomalies Identified</span>
              <span>This action will notify 18 branch Relationship Managers across Pune, Surat, Vidarbha, and Cauvery Delta industrial belts.</span>
            </div>
          </div>

          <div>
            <span className="text-[11px] font-mono uppercase tracking-wider text-[#565e74] block mb-2">Notification Channels</span>
            <div className="grid grid-cols-2 gap-2 text-[13px]">
              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#bcc9c6]/40 bg-[#f8f9ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.sms}
                  onChange={(e) => setSelectedChannels({...selectedChannels, sms: e.target.checked})}
                  className="rounded text-[#00685f] focus:ring-0"
                />
                <span>SMS Alert & WhatsApp Bot</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#bcc9c6]/40 bg-[#f8f9ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.email}
                  onChange={(e) => setSelectedChannels({...selectedChannels, email: e.target.checked})}
                  className="rounded text-[#00685f] focus:ring-0"
                />
                <span>RM High-Priority Email</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#bcc9c6]/40 bg-[#f8f9ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.portal}
                  onChange={(e) => setSelectedChannels({...selectedChannels, portal: e.target.checked})}
                  className="rounded text-[#00685f] focus:ring-0"
                />
                <span>Core Banking Task Queue</span>
              </label>

              <label className="flex items-center gap-2 p-2.5 rounded-lg border border-[#bcc9c6]/40 bg-[#f8f9ff] cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedChannels.rmCall}
                  onChange={(e) => setSelectedChannels({...selectedChannels, rmCall: e.target.checked})}
                  className="rounded text-[#00685f] focus:ring-0"
                />
                <span>Mandate Site Visit Log</span>
              </label>
            </div>
          </div>

          <div className="p-3 bg-[#f2f4f6] rounded-lg border border-[#bcc9c6]/30 text-[12px] text-[#565e74]">
            <span className="font-semibold text-[#0b1c30] block mb-1">Standard Underwriting Protocol:</span>
            <span>RMs are given a 48-hour SLA to inspect asset plinth levels, verify diesel generator run-time fuel reserves, and evaluate temporary moratorium triggers.</span>
          </div>
        </div>

        <div className="px-5 py-3.5 bg-[#f8f9ff] border-t border-[#eceef0] flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-[13px] font-medium text-[#565e74]"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={status !== 'idle'}
            className="px-4 py-2 bg-[#00685f] hover:bg-[#008378] text-white text-[13px] font-semibold rounded-lg flex items-center gap-1.5 shadow-xs disabled:opacity-60"
          >
            {status === 'sending' ? (
              <>
                <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                <span>Broadcasting Alerts...</span>
              </>
            ) : status === 'sent' ? (
              <>
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>18 RMs Notified!</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-[16px]">send</span>
                <span>Dispatch Early Warnings</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
