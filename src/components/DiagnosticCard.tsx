/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, CheckCircle2, AlertTriangle, AlertOctagon, HelpCircle, XCircle, MinusCircle, Copy, Check } from 'lucide-react';
import { TestStatus, Language } from '../types/index.ts';
import { STRINGS } from '../locales/strings.ts';

interface DiagnosticCardProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  status: TestStatus;
  lang: Language;
  primaryValue?: string | React.ReactNode;
  disclaimer?: string;
  children: React.ReactNode;
  defaultExpanded?: boolean;
}

export const DiagnosticCard: React.FC<DiagnosticCardProps> = ({
  title,
  subtitle,
  icon,
  status,
  lang,
  primaryValue,
  disclaimer,
  children,
  defaultExpanded = false
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const t = STRINGS[lang];

  // Map status to badge style
  const statusConfig = {
    PASSED: {
      label: t.statusPassed,
      badgeClass: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/60',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />
    },
    WARNING: {
      label: t.statusWarning,
      badgeClass: 'bg-amber-950/80 text-amber-300 border-amber-700/60',
      icon: <AlertTriangle className="w-4 h-4 text-amber-400" />
    },
    LEAK_DETECTED: {
      label: t.statusLeak,
      badgeClass: 'bg-rose-950/80 text-rose-300 border-rose-700/60 animate-pulse',
      icon: <AlertOctagon className="w-4 h-4 text-rose-400" />
    },
    INCONCLUSIVE: {
      label: t.statusInconclusive,
      badgeClass: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
      icon: <HelpCircle className="w-4 h-4 text-indigo-400" />
    },
    NOT_PERFORMED: {
      label: t.statusNotPerformed,
      badgeClass: 'bg-[#1e1a2f] text-zinc-400 border-[#2f2947]',
      icon: <XCircle className="w-4 h-4 text-zinc-400" />
    },
    NOT_APPLICABLE: {
      label: t.statusNotApplicable,
      badgeClass: 'bg-[#1e1a2f] text-zinc-400 border-[#2f2947]',
      icon: <MinusCircle className="w-4 h-4 text-zinc-500" />
    }
  }[status];

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className="card-print bg-[#110f1a]/90 border border-[#28233d] hover:border-[#383154] rounded-2xl p-5 transition-all shadow-md">
      
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-3 border-b border-[#231e36]">
        
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-[#1d192d] text-violet-400 border border-[#332c4d]">
            {icon}
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              {title}
            </h3>
            <p className="text-xs text-zinc-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${statusConfig.badgeClass}`}>
            {statusConfig.icon}
            <span>{statusConfig.label}</span>
          </span>
        </div>
      </div>

      {/* Primary Value Display */}
      {primaryValue && (
        <div className="my-4 flex items-center justify-between bg-[#090810]/80 border border-[#231e36] rounded-xl px-4 py-3">
          <div className={`text-sm sm:text-base font-medium break-all ${
            typeof primaryValue === 'string' && /[\u0600-\u06FF]/.test(primaryValue)
              ? 'font-sans text-zinc-100'
              : 'font-mono text-violet-400'
          }`} dir={typeof primaryValue === 'string' && /[\u0600-\u06FF]/.test(primaryValue) ? 'rtl' : 'ltr'}>
            {primaryValue}
          </div>
          {typeof primaryValue === 'string' && primaryValue.length > 0 && !primaryValue.includes('غیرفعال') && !primaryValue.includes('ناموجود') && (
            <button
              onClick={() => handleCopy(primaryValue)}
              className="no-print mr-2 text-zinc-400 hover:text-violet-400 transition shrink-0 p-1 rounded"
              title={t.copy}
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          )}
        </div>
      )}

      {/* Honest Disclaimer if present */}
      {disclaimer && (
        <div className="mb-3 p-2.5 rounded-lg bg-indigo-950/30 border border-indigo-900/40 text-[11px] leading-relaxed text-indigo-300/90">
          {disclaimer}
        </div>
      )}

      {/* Expand/Collapse Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="no-print w-full mt-2 pt-2.5 border-t border-[#231e36] flex items-center justify-between text-xs font-medium text-violet-400 hover:text-violet-300 transition"
      >
        <span>{isExpanded ? (lang === 'fa' ? 'بستن جزئیات فنی' : 'Hide Technical Details') : t.viewTechnicalDetails}</span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Technical Details Content */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-[#231e36] text-xs text-zinc-300">
          {children}
        </div>
      )}
    </article>
  );
};
