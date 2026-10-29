/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NetLeakGuard Pro - Dynamic Visual Alert Animation Banner
 * Shows prominent pulsating Red animation on leak detection (Positive result)
 * and calming glowing Green animation on clean network (Negative result).
 */

import React from 'react';
import { ShieldAlert, ShieldCheck, AlertOctagon, CheckCircle2, Lock, Radio, Server } from 'lucide-react';
import { NetworkDiagnosticReport, Language } from '../types/index.ts';

interface AlertAnimationBannerProps {
  report: NetworkDiagnosticReport;
  lang: Language;
}

export const AlertAnimationBanner: React.FC<AlertAnimationBannerProps> = ({ report, lang }) => {
  const isDnsLeak = report.dns.status === 'LEAK_DETECTED';
  const isWebRtcLeak = report.webrtc.status === 'LEAK_DETECTED';
  const isVpnLeak = report.vpnAudit.status === 'LEAK_DETECTED';
  const isDualStackLeak = report.vpnAudit.dualStackLeak;

  const hasLeak = isDnsLeak || isWebRtcLeak || isVpnLeak || isDualStackLeak;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border-2 p-6 sm:p-7 shadow-2xl transition-all duration-500 ${
        hasLeak
          ? 'border-rose-600/80 bg-gradient-to-r from-rose-950/95 via-red-950/70 to-[#08070d] shadow-rose-950/50'
          : 'border-emerald-500/80 bg-gradient-to-r from-emerald-950/95 via-teal-950/70 to-[#08070d] shadow-emerald-950/50'
      }`}
    >
      {/* Background Animated Ripples & Pulses */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {hasLeak ? (
          <>
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-rose-600/20 blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-red-600/15 blur-3xl animate-ping opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-rose-500/10 via-transparent to-transparent animate-pulse" />
          </>
        ) : (
          <>
            <div className="absolute -top-12 -left-12 w-64 h-64 rounded-full bg-emerald-500/20 blur-2xl animate-pulse" />
            <div className="absolute -bottom-12 -right-12 w-64 h-64 rounded-full bg-teal-500/15 blur-3xl opacity-40" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
          </>
        )}
      </div>

      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Left Side: Animated Icon with Multi-ring Waves */}
        <div className="flex items-center gap-5 sm:gap-6 text-center sm:text-right">
          
          <div className="relative flex items-center justify-center shrink-0">
            {/* Outer pulsating wave 1 */}
            <span
              className={`absolute inline-flex h-20 w-20 sm:h-24 sm:w-24 rounded-full opacity-75 animate-ping ${
                hasLeak ? 'bg-rose-500/40' : 'bg-emerald-500/30'
              }`}
            />
            {/* Outer pulsating wave 2 */}
            <span
              className={`absolute inline-flex h-16 w-16 sm:h-20 sm:w-20 rounded-full opacity-60 animate-pulse ${
                hasLeak ? 'bg-rose-600/50' : 'bg-emerald-600/40'
              }`}
            />
            {/* Inner Shield Badge */}
            <div
              className={`relative flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl shadow-xl text-white ${
                hasLeak
                  ? 'bg-gradient-to-br from-rose-500 to-red-700 shadow-rose-600/50 ring-4 ring-rose-500/30'
                  : 'bg-gradient-to-br from-emerald-400 to-teal-600 shadow-emerald-500/50 ring-4 ring-emerald-500/30'
              }`}
            >
              {hasLeak ? (
                <AlertOctagon className="w-8 h-8 text-white animate-bounce" />
              ) : (
                <ShieldCheck className="w-8 h-8 text-white" />
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center gap-2 justify-center sm:justify-start">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  hasLeak ? 'bg-rose-400 animate-ping' : 'bg-emerald-400'
                }`}
              />
              <span
                className={`text-xs font-black tracking-widest uppercase font-mono ${
                  hasLeak ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {hasLeak ? (lang === 'fa' ? 'هشدار بحرانی امنیت' : 'SECURITY ALERT') : (lang === 'fa' ? 'تاییدیه امنیت شبکه' : 'SECURITY VERIFIED')}
              </span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {hasLeak
                ? (lang === 'fa' ? 'نشت فعال در شبکه شناسایی شد!' : 'Active Network Leak Detected!')
                : (lang === 'fa' ? 'وضعیت کاملاً ایمن: هیچ نشتی شناسایی نشد' : 'Secure State: Zero Leaks Detected')}
            </h3>

            <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
              {hasLeak
                ? (lang === 'fa'
                    ? 'شواهد ثبت‌شده نشان می‌دهند که بخشی از هویت واقعی یا آدرس‌های مبدا شما از تونل محافظت عبور نکرده و در معرض دید وب‌سایت‌ها قرار دارد.'
                    : 'Evidence confirms unencrypted or non-tunneled network packets exposed outside protected routing.')
                : (lang === 'fa'
                    ? 'تمامی درخواست‌های DNS، کاندیدهای WebRTC و مسیرهای IP با موفقیت محافظت شده و هیچ نشتی به ارائه‌دهنده اینترنت محلی مشاهده نشد.'
                    : 'All DNS requests, WebRTC candidates, and IP pathways are safely isolated.')}
            </p>
          </div>
        </div>

        {/* Right Side: Fast Vector Status Pills */}
        <div className="flex flex-wrap md:flex-col gap-2 shrink-0 w-full md:w-auto">
          {/* DNS Pill */}
          <div
            className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-sans border ${
              isDnsLeak
                ? 'bg-rose-950/80 border-rose-700/80 text-rose-200'
                : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Server className="w-3.5 h-3.5" />
              <span className="font-medium">{lang === 'fa' ? 'نشت DNS:' : 'DNS Leak:'}</span>
            </div>
            <span className="font-bold">
              {isDnsLeak ? (lang === 'fa' ? 'نشت دارد' : 'LEAKING') : (lang === 'fa' ? 'ایمن' : 'CLEAN')}
            </span>
          </div>

          {/* WebRTC Pill */}
          <div
            className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-sans border ${
              isWebRtcLeak
                ? 'bg-rose-950/80 border-rose-700/80 text-rose-200'
                : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Radio className="w-3.5 h-3.5" />
              <span className="font-medium">{lang === 'fa' ? 'نشت WebRTC:' : 'WebRTC Leak:'}</span>
            </div>
            <span className="font-bold">
              {isWebRtcLeak ? (lang === 'fa' ? 'افشای IP' : 'EXPOSED') : (lang === 'fa' ? 'محافظت‌شده' : 'PROTECTED')}
            </span>
          </div>

          {/* IPv6 Dual-Stack Pill */}
          <div
            className={`flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl text-xs font-sans border ${
              isDualStackLeak
                ? 'bg-rose-950/80 border-rose-700/80 text-rose-200'
                : 'bg-emerald-950/70 border-emerald-800/60 text-emerald-300'
            }`}
          >
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5" />
              <span className="font-medium">{lang === 'fa' ? 'پروتکل IPv6:' : 'IPv6 Tunnel:'}</span>
            </div>
            <span className="font-bold">
              {isDualStackLeak ? (lang === 'fa' ? 'نشت دوگانه' : 'LEAKING') : (lang === 'fa' ? 'منطبق' : 'STABLE')}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
