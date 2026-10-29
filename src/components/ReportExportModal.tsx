/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { X, Download, Printer, FileSpreadsheet, FileJson, CheckCircle2 } from 'lucide-react';
import { NetworkDiagnosticReport, Language } from '../types/index.ts';
import { STRINGS } from '../locales/strings.ts';

interface ReportExportModalProps {
  report: NetworkDiagnosticReport;
  lang: Language;
  onClose: () => void;
}

export const ReportExportModal: React.FC<ReportExportModalProps> = ({ report, lang, onClose }) => {
  const t = STRINGS[lang];

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `NetLeakGuard-Report-${report.id}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleDownloadCSV = () => {
    const rows = [
      ['Metric', 'Value', 'Status'],
      ['Audit ID', report.id, 'INFO'],
      ['Timestamp', report.timestamp, 'INFO'],
      ['Execution Duration (ms)', report.durationMs.toString(), 'INFO'],
      ['Public IPv4', report.ipv4.address || 'N/A', report.ipv4.status],
      ['Public IPv6', report.ipv6.address || 'Disabled/Unavailable', report.ipv6.status],
      ['WebRTC Status', report.webrtc.status, report.webrtc.status],
      ['WebRTC Leaked IPs', report.webrtc.publicIpsFound.join('; ') || 'None', report.webrtc.status],
      ['DNS Status', report.dns.status, report.dns.status],
      ['DNS Resolvers Count', report.dns.resolvers.length.toString(), report.dns.status],
      ['VPN Consistency', report.vpnAudit.status, report.vpnAudit.status],
      ['Country', report.geoip?.country || 'Unknown', 'INFO'],
      ['ISP', report.geoip?.isp || 'Unknown', 'INFO'],
      ['ASN', report.geoip?.asn || 'Unknown', 'INFO'],
      ['Security Score', report.overallScore.score.toString(), 'FINAL'],
      ['SHA-256 Fingerprint', report.sha256EvidenceHash, 'VERIFIED']
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + rows.map(e => e.map(val => `"${val}"`).join(',')).join('\n');
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', encodeURI(csvContent));
    downloadAnchor.setAttribute('download', `NetLeakGuard-Report-${report.id}.csv`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08070d]/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-[#110f1a] border border-[#28233d] w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#231e36] flex items-center justify-between bg-[#090810]/70">
          <div className="flex items-center gap-3">
            <Download className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-base">
              {lang === 'fa' ? 'ذخیره و خروجی گزارش ارزیابی امنیتی' : 'Export Diagnostic Evidence Report'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#221d36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-zinc-400">
            {lang === 'fa'
              ? 'گزارش نهایی شامل تمامی نتایج استخراج‌شده، هدرهای شبکه، هش یکتای اعتبارسنجی (SHA-256) و راهکارهای امنیتی است:'
              : 'Export full audit findings with cryptographic validation signature:'}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={handlePrint}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#1d192d] hover:bg-[#282245] border border-[#332c4d] text-zinc-200 transition group text-center"
            >
              <Printer className="w-6 h-6 text-violet-400 mb-2 group-hover:scale-110 transition" />
              <span className="font-bold text-xs">{t.printPdf}</span>
              <span className="text-[10px] text-zinc-400 mt-1">نسخه چاپی / ذخیره PDF رسمی</span>
            </button>

            <button
              onClick={handleDownloadJSON}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#1d192d] hover:bg-[#282245] border border-[#332c4d] text-zinc-200 transition group text-center"
            >
              <FileJson className="w-6 h-6 text-emerald-400 mb-2 group-hover:scale-110 transition" />
              <span className="font-bold text-xs">{t.downloadJson}</span>
              <span className="text-[10px] text-zinc-400 mt-1">ساختار کامل داده‌های فنی</span>
            </button>

            <button
              onClick={handleDownloadCSV}
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-[#1d192d] hover:bg-[#282245] border border-[#332c4d] text-zinc-200 transition group text-center"
            >
              <FileSpreadsheet className="w-6 h-6 text-amber-400 mb-2 group-hover:scale-110 transition" />
              <span className="font-bold text-xs">{t.downloadCsv}</span>
              <span className="text-[10px] text-zinc-400 mt-1">جدول اکسل برای تحلیل داده</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-[#090810] border border-[#231e36] text-xs text-zinc-300 font-mono">
            <div className="flex items-center gap-1.5 text-violet-400 font-bold mb-1">
              <CheckCircle2 className="w-4 h-4" />
              <span>شناسه گزارش: {report.id}</span>
            </div>
            <div className="text-[11px] text-zinc-400 truncate">
              هش SHA-256: {report.sha256EvidenceHash}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#231e36] bg-[#090810]/70 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-[#1e1933] hover:bg-[#282245] text-zinc-200 text-xs font-medium transition"
          >
            {t.close}
          </button>
        </div>
      </div>
    </div>
  );
};
