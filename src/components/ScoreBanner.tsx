/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, AlertTriangle, FileText, Download, RotateCw, Hash, Copy, Check, Clock } from 'lucide-react';
import { STRINGS } from '../locales/strings.ts';
import { Language, NetworkDiagnosticReport } from '../types/index.ts';

interface ScoreBannerProps {
  report: NetworkDiagnosticReport;
  lang: Language;
  onRetest: () => void;
  onOpenReportModal: () => void;
  onOpenEvidenceModal: () => void;
  isTesting: boolean;
}

export const ScoreBanner: React.FC<ScoreBannerProps> = ({
  report,
  lang,
  onRetest,
  onOpenReportModal,
  onOpenEvidenceModal,
  isTesting
}) => {
  const t = STRINGS[lang];
  const [copiedHash, setCopiedHash] = useState(false);

  const score = report.overallScore.score;
  const isGood = score >= 80;
  const isMedium = score >= 50 && score < 80;

  const scoreColor = isGood
    ? 'text-emerald-400 border-emerald-500/30 bg-emerald-950/30'
    : isMedium
    ? 'text-amber-400 border-amber-500/30 bg-amber-950/30'
    : 'text-rose-400 border-rose-500/30 bg-rose-950/30';

  const badgeIcon = isGood ? (
    <ShieldCheck className="w-5 h-5 text-emerald-400" />
  ) : isMedium ? (
    <AlertTriangle className="w-5 h-5 text-amber-400" />
  ) : (
    <ShieldAlert className="w-5 h-5 text-rose-400" />
  );

  const handleCopyHash = () => {
    navigator.clipboard.writeText(report.sha256EvidenceHash);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <section className="bg-[#110f1a]/90 border border-[#28233d] rounded-2xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background ambient glow */}
      <div
        className={`absolute -top-24 -left-24 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none ${
          isGood ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
        }`}
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        
        {/* Left Side: Score & Status */}
        <div className="flex items-center gap-5">
          {/* Radial/Badge Score */}
          <div className={`flex flex-col items-center justify-center w-24 h-24 rounded-2xl border-2 ${scoreColor} shadow-inner`}>
            <span className="text-3xl font-black font-mono tracking-tight">{score}</span>
            <span className="text-[10px] font-medium uppercase tracking-wider opacity-80 mt-0.5">/ 100</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              {badgeIcon}
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                {lang === 'fa' ? report.overallScore.verdictFa : report.overallScore.verdictEn}
              </h2>
            </div>

            <div className="flex items-center flex-wrap gap-4 mt-2 text-xs text-zinc-400">
              <span className="flex items-center gap-1 font-mono">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                {t.duration} {report.durationMs} {t.ms}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="font-mono text-zinc-400">
                {new Date(report.timestamp).toLocaleTimeString(lang === 'fa' ? 'fa-IR' : 'en-US')}
              </span>
              <span className="text-zinc-600">•</span>
              <span className="px-2 py-0.5 rounded bg-[#1f1b2e] text-zinc-300 font-mono text-[11px]">
                {report.osInfo.platform}
              </span>
            </div>

            {/* Cryptographic Hash */}
            <div className="flex items-center gap-2 mt-3 text-xs bg-[#090810]/80 border border-[#231e36] px-3 py-1.5 rounded-lg max-w-xl w-full overflow-hidden">
              <Hash className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="text-zinc-400 shrink-0 hidden xs:inline">{t.evidenceHash}</span>
              <span className="text-zinc-400 shrink-0 xs:hidden">SHA-256:</span>
              <code className="text-zinc-200 font-mono text-[10px] sm:text-[11px] truncate select-all flex-1">
                {report.sha256EvidenceHash}
              </code>
              <button
                onClick={handleCopyHash}
                className="text-zinc-400 hover:text-violet-400 transition ml-auto shrink-0 p-1"
                title={t.copy}
              >
                {copiedHash ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <button
            onClick={onOpenEvidenceModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d192d] hover:bg-[#28233e] border border-[#332c4d] text-zinc-200 text-sm font-medium transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-violet-400" />
            <span>{t.viewTechnicalDetails}</span>
          </button>

          <button
            onClick={onOpenReportModal}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-950/70 hover:bg-violet-900/80 border border-violet-700/60 text-violet-200 text-sm font-medium transition active:scale-95"
          >
            <Download className="w-4 h-4 text-violet-400" />
            <span>{t.exportReport}</span>
          </button>

          <button
            onClick={onRetest}
            disabled={isTesting}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1d192d] hover:bg-[#28233e] border border-[#332c4d] text-zinc-200 text-sm font-medium transition active:scale-95 disabled:opacity-50"
          >
            <RotateCw className={`w-4 h-4 text-zinc-300 ${isTesting ? 'animate-spin' : ''}`} />
            <span>{t.retest}</span>
          </button>
        </div>
      </div>
    </section>
  );
};
