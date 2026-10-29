/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NetLeakGuard Pro - IP Type, VPN Detection & Google Acceptance Index Card
 * Audits whether the IP is Residential, Commercial, or Datacenter,
 * determines VPN connection presence, checks fraud flags,
 * and provides a percentage acceptance score for Google and major websites.
 */

import React, { useState } from 'react';
import {
  Building2,
  Home,
  Server,
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCircle2,
  Lock,
  Globe2,
  Sparkles,
  CreditCard,
  Film
} from 'lucide-react';
import { GeoIPRecord, Language } from '../types/index.ts';

interface IPTypeAndFraudCardProps {
  geoip: GeoIPRecord | null;
  lang: Language;
}

export const IPTypeAndFraudCard: React.FC<IPTypeAndFraudCardProps> = ({ geoip, lang }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  if (!geoip) {
    return null;
  }

  const usage = geoip.usageType;
  const reputation = geoip.reputation;
  const trust = reputation?.trustScore;

  const isDatacenter = usage?.type === 'datacenter';
  const isResidential = usage?.type === 'residential';
  const isBusiness = usage?.type === 'business';

  const typeIcon = isResidential ? (
    <Home className="w-5 h-5 text-emerald-400" />
  ) : isBusiness ? (
    <Building2 className="w-5 h-5 text-blue-400" />
  ) : (
    <Server className="w-5 h-5 text-purple-400" />
  );

  const fraudScore = reputation?.fraudScore ?? 0;
  const overallTrust = trust?.overallTrustScore ?? 85;
  const isHighRisk = reputation?.riskLevel === 'HIGH';
  const isMediumRisk = reputation?.riskLevel === 'MEDIUM';

  const trustColor = overallTrust >= 80
    ? 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40'
    : overallTrust >= 50
    ? 'text-amber-400 border-amber-500/40 bg-amber-950/40'
    : 'text-rose-400 border-rose-500/40 bg-rose-950/40';

  const fraudBadgeColor = isHighRisk
    ? 'text-rose-400 bg-rose-950/80 border-rose-700/60'
    : isMediumRisk
    ? 'text-amber-400 bg-amber-950/80 border-amber-700/60'
    : 'text-emerald-400 bg-emerald-950/80 border-emerald-700/60';

  return (
    <article className="card-print bg-slate-900/90 border border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xl transition-all">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-slate-800/90 text-cyan-400 border border-slate-700/60">
            {typeIcon}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              {lang === 'fa' ? 'امتیاز پذیرش در گوگل، نوع IP و تشخیص VPN' : 'Google Acceptance Index, IP Type & VPN Status'}
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              {lang === 'fa'
                ? 'سنجش میزان قبولی در گوگل، تفکیک IP مسکونی از تجاری و بررسی سابقه کلاهبرداری'
                : 'Google acceptance index, residential vs datacenter audit, and threat status'}
            </p>
          </div>
        </div>

        {/* Status Pill */}
        <div className="flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${fraudBadgeColor}`}>
            {isHighRisk ? <ShieldAlert className="w-4 h-4" /> : isMediumRisk ? <AlertTriangle className="w-4 h-4" /> : <ShieldCheck className="w-4 h-4" />}
            <span>{lang === 'fa' ? reputation?.riskLabelFa : reputation?.riskLabelEn}</span>
          </span>
        </div>
      </div>

      {/* Prominent Google & Major Sites Acceptance Showcase Banner */}
      <div className="my-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-5 shadow-inner">
        
        {/* Left: Score Radial / Badge */}
        <div className="flex items-center gap-4 text-center sm:text-right">
          <div className={`flex flex-col items-center justify-center w-20 h-20 sm:w-22 sm:h-22 rounded-2xl border-2 ${trustColor} shadow-lg shrink-0`}>
            <span className="text-2xl sm:text-3xl font-black font-mono tracking-tight">{overallTrust}%</span>
            <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mt-0.5">
              {lang === 'fa' ? 'امتیاز پذیرش' : 'Trust Index'}
            </span>
          </div>

          <div className="space-y-1">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <Globe2 className="w-4 h-4 text-cyan-400" />
              <h4 className="text-base sm:text-lg font-bold text-white">
                {lang === 'fa' ? 'میزان پذیرش در گوگل و سایت‌های بزرگ:' : 'Major Sites & Google Acceptance:'}
              </h4>
            </div>
            <p className="text-xs text-cyan-300 font-medium">
              {trust?.verdictFa}
            </p>
            <p className="text-[11px] text-slate-400 leading-relaxed max-w-xl">
              {reputation?.googleFlagNoteFa}
            </p>
          </div>
        </div>

        {/* Right: Sub-rates */}
        <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto shrink-0 font-mono text-xs">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[11px] mb-1">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>پذیرش در گوگل:</span>
            </div>
            <span className="text-cyan-300 font-bold text-sm">{trust?.googleAcceptanceRate}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[11px] mb-1">
              <CreditCard className="w-3.5 h-3.5 text-emerald-400" />
              <span>سرویس‌های مالی:</span>
            </div>
            <span className="text-emerald-300 font-bold text-sm">{trust?.financialServicesRate}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="flex items-center gap-1.5 text-slate-400 font-sans text-[11px] mb-1">
              <Film className="w-3.5 h-3.5 text-purple-400" />
              <span>پلتفرم‌های استریم:</span>
            </div>
            <span className="text-purple-300 font-bold text-sm">{trust?.streamingServicesRate}%</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
            <div className="text-slate-400 font-sans text-[11px] mb-1">چالش کپچا (CAPTCHA):</div>
            <span className="text-slate-200 font-sans text-[11px] font-bold truncate block">
              {trust?.captchaFrictionFa}
            </span>
          </div>
        </div>

      </div>

      {/* Main Grid: 3 Analytical Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 my-4">
        
        {/* Metric 1: IP Type (Residential vs Datacenter) */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <span className="text-[11px] text-slate-400 block font-medium">
            {lang === 'fa' ? 'نوع تخصیص آدرس IP:' : 'IP Allocation Type:'}
          </span>
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-white">
              {lang === 'fa' ? usage?.labelFa : usage?.labelEn}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {lang === 'fa' ? usage?.descriptionFa : usage?.descriptionEn}
          </p>
        </div>

        {/* Metric 2: VPN / Proxy Detection Heuristic */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <span className="text-[11px] text-slate-400 block font-medium">
            {lang === 'fa' ? 'وضعیت اتصال VPN / پروکسی:' : 'VPN / Proxy Status:'}
          </span>
          <div className="flex items-center gap-2">
            <span
              className={`text-sm sm:text-base font-bold ${
                usage?.isVpnLikely ? 'text-purple-400' : 'text-slate-200'
              }`}
            >
              {usage?.isVpnLikely
                ? (lang === 'fa' ? 'اتصال VPN / پروکسی فعال است' : 'VPN / Proxy Detected')
                : (lang === 'fa' ? 'اتصال مستقیم (بدون VPN دیتاسنتری)' : 'Direct Connection (No VPN)')}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            {usage?.isVpnLikely
              ? (lang === 'fa'
                  ? 'ترافیک از طریق سرور میزبانی ابری یا دیتاسنتر عبور می‌کند که نشانه قطعی اتصال شما از طریق VPN، تونل یا پروکسی است.'
                  : 'Traffic egresses via datacenter hosting range, typical of VPN tunnels.')
              : (lang === 'fa'
                  ? 'آدرس از ارائه‌دهنده اینترنت خانگی یا سیم‌کارت همراه صادر شده و نشانی از سرورهای VPN خارجی دیده نمی‌شود.'
                  : 'Direct residential consumer ISP routing detected.')}
          </p>
        </div>

        {/* Metric 3: Fraud Risk Score & Blacklist */}
        <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800/90 space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-[11px] text-slate-400 font-medium">
              {lang === 'fa' ? 'ریسک کلاهبرداری و سوءاستفاده:' : 'Fraud & Abuse Risk:'}
            </span>
            <span className="text-xs font-mono font-bold text-white">{fraudScore}%</span>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-500 ${
                isHighRisk ? 'bg-rose-500' : isMediumRisk ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${fraudScore}%` }}
            />
          </div>

          <div className="pt-1">
            <span className="text-[11px] text-slate-300 block leading-relaxed">
              {reputation?.riskLabelFa}
            </span>
          </div>
        </div>

      </div>

      {/* Accordion Toggle */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="no-print w-full mt-1 pt-2.5 border-t border-slate-800/60 flex items-center justify-between text-xs font-medium text-cyan-400 hover:text-cyan-300 transition"
      >
        <span>
          {isExpanded
            ? (lang === 'fa' ? 'بستن شواهد اعتبارسنجی و بلک‌لیست' : 'Hide Reputation Evidence')
            : (lang === 'fa' ? 'مشاهده جزئیات بررسی کلاهبرداری، فیشینگ و گوگل' : 'View Fraud & Google Flag Evidence')}
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {/* Detailed Evidence Log */}
      {isExpanded && (
        <div className="mt-3 pt-3 border-t border-slate-800/70 text-xs space-y-3 animate-fade-in">
          
          <div className="p-3 bg-slate-950/70 rounded-xl border border-slate-800 space-y-2">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <Search className="w-4 h-4 text-cyan-400" />
              <span>{lang === 'fa' ? 'شواهد ثبت‌شده در سیستم‌های هوش تهدیدات و گوگل:' : 'Logged Threat Intelligence & Google Heuristics:'}</span>
            </div>

            <div className="space-y-1.5 text-slate-300">
              {reputation?.evidenceFa.map((ev, i) => (
                <div key={i} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-cyan-400 shrink-0">•</span>
                  <span>{ev}</span>
                </div>
              ))}
              {usage?.evidenceDetailsFa.map((ev, i) => (
                <div key={`u-${i}`} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-purple-400 shrink-0">•</span>
                  <span>{ev}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Notice on Google flags */}
          <div className="p-2.5 rounded-lg bg-blue-950/30 border border-blue-900/40 text-[11px] leading-relaxed text-blue-300/90">
            {lang === 'fa'
              ? 'راهنمایی: وب‌سایت‌های بانکی، مالی و موتور جستجوی گوگل به طور خودکار به IPهای دیتاسنتر (VPN) حساس بوده و نرخ درخواست کپچا (CAPTCHA) در آن‌ها بالاتر است. برای امور حساس بانکی استفاده از IP مسکونی تمیز توصیه می‌شود.'
              : 'Notice: Google and banking institutions monitor datacenter IP ranges closely. Clean residential connections face fewer CAPTCHA challenges.'}
          </div>

        </div>
      )}

    </article>
  );
};
