/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Copy, Check, Terminal, FileCode, Server, Shield } from 'lucide-react';
import { NetworkDiagnosticReport, Language } from '../types/index.ts';
import { STRINGS } from '../locales/strings.ts';

interface EvidenceModalProps {
  report: NetworkDiagnosticReport;
  lang: Language;
  onClose: () => void;
}

export const EvidenceModal: React.FC<EvidenceModalProps> = ({ report, lang, onClose }) => {
  const t = STRINGS[lang];
  const [tab, setTab] = useState<'summary' | 'webrtc' | 'dns' | 'raw'>('summary');
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08070d]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#110f1a] border border-[#28233d] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#231e36] flex items-center justify-between bg-[#090810]/70">
          <div className="flex items-center gap-3">
            <Terminal className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-base sm:text-lg">
              {lang === 'fa' ? 'گزارش شواهد فنی و مستندات شبکه' : 'Technical Evidence & Network Log'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#221d36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-[#231e36] px-6 gap-2 bg-[#0d0b14] overflow-x-auto text-xs">
          <button
            onClick={() => setTab('summary')}
            className={`py-3 px-3 font-medium border-b-2 transition whitespace-nowrap ${
              tab === 'summary'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {lang === 'fa' ? 'خلاصه شواهد' : 'Evidence Summary'}
          </button>
          <button
            onClick={() => setTab('webrtc')}
            className={`py-3 px-3 font-medium border-b-2 transition whitespace-nowrap ${
              tab === 'webrtc'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            WebRTC Candidates ({report.webrtc.candidates.length})
          </button>
          <button
            onClick={() => setTab('dns')}
            className={`py-3 px-3 font-medium border-b-2 transition whitespace-nowrap ${
              tab === 'dns'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            DNS Resolvers ({report.dns.resolvers.length})
          </button>
          <button
            onClick={() => setTab('raw')}
            className={`py-3 px-3 font-medium border-b-2 transition whitespace-nowrap ${
              tab === 'raw'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {lang === 'fa' ? 'داده خام JSON' : 'Raw JSON Payload'}
          </button>
        </div>

        {/* Content body */}
        <div className="p-6 overflow-y-auto space-y-4 text-xs">
          {tab === 'summary' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#090810]/90 p-4 rounded-xl border border-[#231e36]">
                  <h4 className="text-zinc-200 font-semibold mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-violet-400" />
                    {lang === 'fa' ? 'شاخص‌های سیستمی و سخت‌افزاری' : 'System Telemetry'}
                  </h4>
                  <ul className="space-y-1.5 text-zinc-400 font-mono">
                    <li>سیستم‌عامل: <span className="text-zinc-200">{report.osInfo.platform}</span></li>
                    <li>رزولوشن: <span className="text-zinc-200">{report.osInfo.screenResolution}</span></li>
                    <li>زبان مرورگر: <span className="text-zinc-200">{report.osInfo.browserLanguage}</span></li>
                    <li>منطقه زمانی سیستم: <span className="text-zinc-200">{Intl.DateTimeFormat().resolvedOptions().timeZone}</span></li>
                  </ul>
                </div>

                <div className="bg-[#090810]/90 p-4 rounded-xl border border-[#231e36]">
                  <h4 className="text-zinc-200 font-semibold mb-2 flex items-center gap-2">
                    <Server className="w-4 h-4 text-emerald-400" />
                    {lang === 'fa' ? 'شواهد آدرس‌های عمومی' : 'Public IP Evidence'}
                  </h4>
                  <ul className="space-y-1.5 text-zinc-400 font-mono">
                    <li>IPv4: <span className="text-violet-400">{report.ipv4.address || 'ناموجود'}</span></li>
                    <li>IPv6: <span className="text-emerald-400">{report.ipv6.address || 'غیرفعال در شبکه'}</span></li>
                    <li>ISP: <span className="text-zinc-200">{report.geoip?.isp || 'نامشخص'}</span></li>
                    <li>ASN: <span className="text-zinc-200">{report.geoip?.asn || 'نامشخص'}</span></li>
                  </ul>
                </div>
              </div>

              {/* Evidence Log Lines */}
              <div className="bg-[#090810]/90 p-4 rounded-xl border border-[#231e36]">
                <h4 className="text-zinc-200 font-semibold mb-2">
                  {lang === 'fa' ? 'شواهد ثبت‌شده در موتور ارزیابی امنیتی' : 'Engine Logged Findings'}
                </h4>
                <div className="space-y-2">
                  {report.vpnAudit.evidenceFa.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-zinc-300">
                      <span className="text-violet-400">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'webrtc' && (
            <div className="space-y-3">
              <p className="text-zinc-400">
                {lang === 'fa'
                  ? 'کاندیدهای استخراج‌شده از پروتکل ICE مرورگر از طریق سرورهای STUN:'
                  : 'Extracted ICE candidates via STUN reflex:'}
              </p>
              {report.webrtc.candidates.length === 0 ? (
                <div className="p-4 bg-[#090810]/50 rounded-lg text-zinc-400">
                  {lang === 'fa' ? 'هیچ کاندید ICE یافت نشد.' : 'No candidates collected.'}
                </div>
              ) : (
                <div className="divide-y divide-[#231e36] bg-[#090810]/80 rounded-xl border border-[#231e36] overflow-hidden font-mono">
                  {report.webrtc.candidates.map((c, i) => (
                    <div key={i} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#1e1933] text-violet-300 text-[10px] uppercase font-bold">
                          {c.type}
                        </span>
                        <span className="text-zinc-200">{c.address}</span>
                        {c.port && <span className="text-zinc-500">:{c.port}</span>}
                      </div>
                      <span className="text-[11px] text-zinc-400">
                        {c.classification.persianLabel}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'dns' && (
            <div className="space-y-3">
              <p className="text-zinc-400">
                {lang === 'fa'
                  ? 'سرورهای DNS شناسایی‌شده در جریان ارسال درخواست‌های تفکیک نام:'
                  : 'Detected DNS resolvers in query resolution flow:'}
              </p>
              {report.dns.resolvers.length === 0 ? (
                <div className="p-4 bg-[#090810]/50 rounded-lg text-zinc-400">
                  {lang === 'fa' ? 'هیچ کارگزار DNS شناسایی نشد.' : 'No resolvers captured.'}
                </div>
              ) : (
                <div className="divide-y divide-[#231e36] bg-[#090810]/80 rounded-xl border border-[#231e36] overflow-hidden font-mono">
                  {report.dns.resolvers.map((r, i) => (
                    <div key={i} className="p-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      <div>
                        <div className="text-violet-400 font-bold">{r.ip}</div>
                        <div className="text-zinc-400 text-[11px]">{r.isp || 'Unknown ISP'}</div>
                      </div>
                      <div className="text-right">
                        <span className="px-2 py-0.5 rounded bg-[#1e1933] text-zinc-300 text-[11px]">
                          {r.country || 'Global'}
                        </span>
                        {r.isKnownPublicDoH && (
                          <span className="mr-2 px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[10px] border border-emerald-800">
                            DoH
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {tab === 'raw' && (
            <div className="relative">
              <button
                onClick={() => handleCopy(JSON.stringify(report, null, 2))}
                className="absolute top-2 left-2 flex items-center gap-1 px-2.5 py-1 rounded bg-[#1e1933] hover:bg-[#282245] text-zinc-300 text-[11px] font-sans transition"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{t.copy}</span>
              </button>
              <pre className="p-4 bg-[#06050a] rounded-xl border border-[#231e36] text-violet-300/90 font-mono text-[11px] overflow-x-auto max-h-96">
                {JSON.stringify(report, null, 2)}
              </pre>
            </div>
          )}
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
