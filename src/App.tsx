/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * NetLeakGuard Pro - Professional IP & DNS Leak Detection Software
 * Windows 10/11 & Android Compatible
 */

import React, { useState, useEffect } from 'react';
import {
  Play,
  RotateCw,
  Globe,
  Radio,
  Server,
  ShieldAlert,
  ShieldCheck,
  MapPin,
  FileCheck2,
  AlertCircle,
  HelpCircle,
  Wifi,
  ExternalLink,
  Laptop,
  Smartphone,
  Lock,
  Layers
} from 'lucide-react';

import { Header } from './components/Header.tsx';
import { ScoreBanner } from './components/ScoreBanner.tsx';
import { DiagnosticCard } from './components/DiagnosticCard.tsx';
import { EvidenceModal } from './components/EvidenceModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { BuildGuideModal } from './components/BuildGuideModal.tsx';
import { ReportExportModal } from './components/ReportExportModal.tsx';
import { AlertAnimationBanner } from './components/AlertAnimationBanner.tsx';
import { IPTypeAndFraudCard } from './components/IPTypeAndFraudCard.tsx';

import {
  runFullDiagnostic,
  NetworkDiagnosticReport,
  UserVpnConfig,
  DiagnosticProgress,
  Language
} from './types/index.ts';
import { STRINGS } from './locales/strings.ts';

export default function App() {
  const [lang, setLang] = useState<Language>('fa');
  const t = STRINGS[lang];

  // User VPN expectation config
  const [vpnConfig, setVpnConfig] = useState<UserVpnConfig>({
    isVpnExpectedActive: false,
    expectedCountryCode: '',
    expectedIpPrefix: ''
  });

  // State
  const [isTesting, setIsTesting] = useState(false);
  const [progress, setProgress] = useState<DiagnosticProgress | null>(null);
  const [report, setReport] = useState<NetworkDiagnosticReport | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Modals
  const [showEvidenceModal, setShowEvidenceModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showBuildGuideModal, setShowBuildGuideModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  // Start test runner
  const handleStartTest = async () => {
    if (isTesting) return;
    setIsTesting(true);
    setErrorMsg(null);
    setProgress({
      stepIndex: 1,
      totalSteps: 7,
      percentage: 5,
      currentTaskFa: 'در حال آماده‌سازی سوکت‌ها و باز کردن ارتباطات آزمایشی...',
      currentTaskEn: 'Initializing network sockets and diagnostic probes...'
    });

    try {
      const result = await runFullDiagnostic(vpnConfig, prog => {
        setProgress(prog);
      });
      setReport(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'خطا در اجرای آزمایش کامل شبکه.');
    } finally {
      setIsTesting(false);
      setProgress(null);
    }
  };

  // Support ?autostart=1 query parameter for automated verification
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') {
        handleStartTest();
      }
    }
  }, []);

  const hasLeak = report
    ? report.webrtc.status === 'LEAK_DETECTED' ||
      report.dns.status === 'LEAK_DETECTED' ||
      report.vpnAudit.status === 'LEAK_DETECTED'
    : false;

  return (
    <div className={`min-h-screen bg-[#08070d] text-zinc-100 flex flex-col font-sans ${lang === 'fa' ? 'rtl' : 'ltr'}`} dir={lang === 'fa' ? 'rtl' : 'ltr'}>
      
      {/* Header Bar */}
      <Header
        lang={lang}
        onToggleLang={() => setLang(prev => (prev === 'fa' ? 'en' : 'fa'))}
        onOpenSettings={() => setShowSettingsModal(true)}
        onOpenBuildGuide={() => setShowBuildGuideModal(true)}
        isTesting={isTesting}
        hasRunTest={Boolean(report)}
        hasLeak={hasLeak}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Hero Action Section */}
        <section className="no-print bg-[#110f1a] border border-[#28233d] rounded-2xl p-6 sm:p-8 text-center shadow-xl relative overflow-hidden">
          
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-950/70 border border-violet-800/60 text-violet-300 text-xs font-medium">
              <Wifi className="w-3.5 h-3.5 text-violet-400" />
              <span>{lang === 'fa' ? 'موتور جامع راستی‌آزمایی نشت بدون داده‌های ساختگی' : 'Authentic Zero-Fake Diagnostic Engine'}</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {lang === 'fa'
                ? 'تشخیص همزمان نشت IP، نشت DNS و نشت WebRTC'
                : 'Simultaneous IP, DNS & WebRTC Leak Detection'}
            </h2>

            <p className="text-sm text-zinc-400 leading-relaxed">
              {lang === 'fa'
                ? 'با فشار دادن دکمه زیر، ۱۰ شاخص تخصصی شبکه شامل آدرس‌های عمومی IPv4 و IPv6، کاندیدهای STUN، ریزالورهای DoH و سازگاری VPN با دقت بالا و شواهد فنی کامل بررسی می‌شوند.'
                : 'Audit public IPv4/IPv6, STUN ICE candidates, DNS resolvers, and VPN compatibility with full technical evidence.'}
            </p>

            {/* The BIG Button */}
            <div className="pt-2">
              <button
                onClick={handleStartTest}
                disabled={isTesting}
                className="inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-violet-600 hover:from-violet-500 to-indigo-600 hover:to-indigo-500 text-white font-bold text-base sm:text-lg shadow-xl shadow-violet-600/25 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isTesting ? (
                  <>
                    <RotateCw className="w-5 h-5 animate-spin" />
                    <span>{t.runningTest}</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-current" />
                    <span>{report ? t.retest : t.startTest}</span>
                  </>
                )}
              </button>
            </div>

            {/* Progress indicator */}
            {isTesting && progress && (
              <div className="pt-4 space-y-2 animate-fade-in">
                <div className="flex items-center justify-between text-xs text-zinc-300 font-mono">
                  <span className="font-sans text-violet-400 font-medium">
                    {lang === 'fa' ? progress.currentTaskFa : progress.currentTaskEn}
                  </span>
                  <span>{progress.percentage}%</span>
                </div>
                <div className="w-full bg-[#090810] rounded-full h-2.5 overflow-hidden border border-[#28233d]">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-indigo-500 h-2.5 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${progress.percentage}%` }}
                  />
                </div>
                <div className="text-[11px] text-zinc-500 font-mono">
                  گام {progress.stepIndex} از {progress.totalSteps}
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </section>

        {/* Executive Alert Animation Banner (Red for leak, Green for clean) */}
        {report && (
          <AlertAnimationBanner
            report={report}
            lang={lang}
          />
        )}

        {/* Executive Score Banner */}
        {report && (
          <ScoreBanner
            report={report}
            lang={lang}
            onRetest={handleStartTest}
            onOpenReportModal={() => setShowReportModal(true)}
            onOpenEvidenceModal={() => setShowEvidenceModal(true)}
            isTesting={isTesting}
          />
        )}

        {/* IP Type, VPN State & Google Acceptance Index */}
        {report && (
          <IPTypeAndFraudCard
            geoip={report.geoip}
            lang={lang}
          />
        )}

        {/* 7 Diagnostic Cards Grid */}
        {report ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            {/* 1. Public IPv4 */}
            <DiagnosticCard
              title={t.cardIpv4Title}
              subtitle={t.cardIpv4Desc}
              icon={<Globe className="w-5 h-5" />}
              status={report.ipv4.status}
              lang={lang}
              primaryValue={report.ipv4.address || 'در دسترس نیست'}
              defaultExpanded={true}
            >
              <div className="space-y-3 font-mono">
                <div className="text-zinc-400 font-sans">
                  نتایج استعلام از سرویس‌های مستقل:
                </div>
                {report.ipv4.sources.length === 0 ? (
                  <div className="text-zinc-500 font-sans">ارائه‌دهنده‌ای پاسخ نداد.</div>
                ) : (
                  <div className="divide-y divide-[#28233d] bg-[#090810] rounded-xl border border-[#28233d] overflow-hidden">
                    {report.ipv4.sources.map((s, idx) => (
                      <div key={idx} className="p-2.5 flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-sans">{s.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-violet-400 font-mono">{s.ip}</span>
                          <span className="text-[10px] text-zinc-500 font-mono">({s.latencyMs}ms)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {report.ipv4.discrepancyNoteFa && (
                  <div className="p-2 rounded bg-amber-950/40 border border-amber-900/60 text-amber-300 text-[11px] font-sans">
                    {report.ipv4.discrepancyNoteFa}
                  </div>
                )}
              </div>
            </DiagnosticCard>

            {/* 2. Public IPv6 */}
            <DiagnosticCard
              title={t.cardIpv6Title}
              subtitle={t.cardIpv6Desc}
              icon={<Radio className="w-5 h-5" />}
              status={report.ipv6.status}
              lang={lang}
              primaryValue={report.ipv6.address || (lang === 'fa' ? 'غیرفعال / ناموجود در شبکه' : 'Disabled / Unavailable')}
              disclaimer={lang === 'fa' ? 'توجه: نبود اتصال IPv6 نشت تلقی نمی‌شود، بلکه نشانه عدم پشتیبانی شبکه از این پروتکل است.' : 'IPv6 unavailability is not considered a leak.'}
            >
              <div className="space-y-2 text-xs">
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {report.ipv6.explanationFa}
                </p>
                {report.ipv6.sources.length > 0 && (
                  <div className="p-2.5 rounded-lg bg-[#090810] border border-[#28233d] font-mono text-violet-400">
                    {report.ipv6.sources.map(s => `${s.name}: ${s.ip}`).join('\n')}
                  </div>
                )}
              </div>
            </DiagnosticCard>

            {/* 3. DNS Leak Test */}
            <DiagnosticCard
              title={t.cardDnsTitle}
              subtitle={t.cardDnsDesc}
              icon={<Server className="w-5 h-5" />}
              status={report.dns.status}
              lang={lang}
              primaryValue={
                report.dns.resolvers.length > 0
                  ? `${report.dns.resolvers.length} ریزالور شناسایی شد (${report.dns.detectedCountries.join(', ') || 'Global'})`
                  : 'پاسخی از ریزالورها دریافت نشد'
              }
              disclaimer={t.honestDnsDisclaimer}
              defaultExpanded={true}
            >
              <div className="space-y-3">
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {report.dns.explanationFa}
                </p>
                {report.dns.resolvers.length > 0 && (
                  <div className="divide-y divide-[#28233d] bg-[#090810] rounded-xl border border-[#28233d] overflow-hidden font-mono">
                    {report.dns.resolvers.map((r, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                        <div>
                          <span className="text-violet-400 font-bold">{r.ip}</span>
                          <span className="text-zinc-400 font-sans mr-2 text-[11px]">({r.isp})</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="px-2 py-0.5 rounded bg-[#181524] text-zinc-300 text-[10px]">
                            {r.country || 'Global'}
                          </span>
                          {r.isKnownPublicDoH && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 text-[9px] border border-emerald-800">
                              DoH
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DiagnosticCard>

            {/* 4. WebRTC IP Leak */}
            <DiagnosticCard
              title={t.cardWebrtcTitle}
              subtitle={t.cardWebrtcDesc}
              icon={<Radio className="w-5 h-5" />}
              status={report.webrtc.status}
              lang={lang}
              primaryValue={
                report.webrtc.publicIpsFound.length > 0
                  ? report.webrtc.publicIpsFound.join(', ')
                  : report.webrtc.hasMdnsObfuscation
                  ? 'محافظت‌شده با فناوری mDNS (بدون افشا)'
                  : report.webrtc.candidates.length > 0
                  ? 'تنها آدرس‌های شبکه خصوصی مشاهده شد (بدون نشت)'
                  : 'کاندید ICE دریافت نشد (WebRTC غیرفعال یا مسدود)'
              }
              disclaimer={t.honestWebRtcDisclaimer}
              defaultExpanded={true}
            >
              <div className="space-y-3">
                <p className="text-zinc-300 font-sans leading-relaxed">
                  {report.webrtc.leakDetailsFa}
                </p>
                {report.webrtc.candidates.length > 0 && (
                  <div className="divide-y divide-[#28233d] bg-[#090810] rounded-xl border border-[#28233d] overflow-hidden font-mono">
                    {report.webrtc.candidates.map((c, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded bg-[#181524] text-violet-300 text-[9px] uppercase font-bold">
                            {c.type}
                          </span>
                          <span className="text-zinc-200">{c.address}</span>
                        </div>
                        <span className="text-zinc-400 text-[10px] font-sans">
                          {c.classification.persianLabel}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </DiagnosticCard>

            {/* 5. VPN & Proxy Consistency */}
            <DiagnosticCard
              title={t.cardVpnTitle}
              subtitle={t.cardVpnDesc}
              icon={<ShieldCheck className="w-5 h-5" />}
              status={report.vpnAudit.status}
              lang={lang}
              primaryValue={
                report.vpnAudit.dualStackLeak
                  ? 'نشت ترافیک پروتکل دوگانه'
                  : report.vpnAudit.timeZoneMismatch
                  ? 'عدم انطباق منطقه زمانی مرورگر و IP'
                  : 'مسیرها پایدار و منطبق'
              }
            >
              <div className="space-y-2">
                <div className="p-3 bg-[#090810] rounded-xl border border-[#28233d] space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">منطقه زمانی مرورگر:</span>
                    <span className="text-zinc-200 font-mono">{report.vpnAudit.browserTimezone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">منطقه زمانی IP:</span>
                    <span className="text-zinc-200 font-mono">{report.vpnAudit.ipTimezone || 'نامشخص'}</span>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  {report.vpnAudit.evidenceFa.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-1.5 text-zinc-300 leading-relaxed">
                      <span className="text-violet-400 shrink-0">•</span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </DiagnosticCard>

            {/* 6. GeoIP & Network Details */}
            <DiagnosticCard
              title={t.cardGeoTitle}
              subtitle={t.cardGeoDesc}
              icon={<MapPin className="w-5 h-5" />}
              status="PASSED"
              lang={lang}
              primaryValue={
                report.geoip
                  ? `${report.geoip.country} (${report.geoip.city}) - ${report.geoip.isp}`
                  : 'نامشخص'
              }
              disclaimer={t.geoDisclaimer}
            >
              {report.geoip ? (
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="p-2.5 rounded-lg bg-[#090810] border border-[#28233d]">
                    <span className="text-zinc-400 font-sans block text-[11px]">کشور و منطقه:</span>
                    <span className="text-zinc-200 font-bold">{report.geoip.country} ({report.geoip.region})</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#090810] border border-[#28233d]">
                    <span className="text-zinc-400 font-sans block text-[11px]">شهر:</span>
                    <span className="text-zinc-200 font-bold">{report.geoip.city}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#090810] border border-[#28233d]">
                    <span className="text-zinc-400 font-sans block text-[11px]">ارائه‌دهنده (ISP):</span>
                    <span className="text-violet-400 font-bold truncate block">{report.geoip.isp}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-[#090810] border border-[#28233d]">
                    <span className="text-zinc-400 font-sans block text-[11px]">شماره ASN:</span>
                    <span className="text-emerald-400 font-bold">{report.geoip.asn}</span>
                  </div>
                </div>
              ) : (
                <p className="text-zinc-400">اطلاعات موقعیت جغرافیایی در دسترس نیست.</p>
              )}
            </DiagnosticCard>

            {/* 7. Remediation & Actionable Recommendations */}
            <div className="md:col-span-2">
              <DiagnosticCard
                title={t.cardRecommendationsTitle}
                subtitle={t.cardRecommendationsDesc}
                icon={<FileCheck2 className="w-5 h-5 text-emerald-400" />}
                status={hasLeak ? 'WARNING' : 'PASSED'}
                lang={lang}
                defaultExpanded={true}
              >
                <div className="space-y-3">
                  {report.vpnAudit.recommendationsFa.length > 0 ? (
                    <div className="space-y-2">
                      <div className="font-semibold text-zinc-200 font-sans">
                        دستورالعمل‌های رفع آسیب‌پذیری و ارتقای امنیت:
                      </div>
                      <div className="space-y-2">
                        {report.vpnAudit.recommendationsFa.map((rec, idx) => (
                          <div key={idx} className="p-3 rounded-xl bg-[#090810] border border-[#28233d] flex items-start gap-2.5 text-zinc-300 font-sans leading-relaxed">
                            <span className="text-emerald-400 font-bold shrink-0">{idx + 1}.</span>
                            <span>{rec}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-emerald-300 font-sans">
                      هیچ نشت تاییدشده‌ای مشاهده نشد. تنظیمات فعلی سیستم، کارت‌های شبکه و ریزالورها از خط‌مشی حریم خصوصی پیروی می‌کنند.
                    </p>
                  )}
                </div>
              </DiagnosticCard>
            </div>

          </div>
        ) : (
          /* Empty / Initial State Preview Cards */
          <div className="no-print grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            <div className="p-5 rounded-2xl bg-[#110f1a] border border-[#28233d] flex flex-col items-center text-center">
              <Globe className="w-8 h-8 text-violet-400 mb-3" />
              <h3 className="font-bold text-white text-sm">بررسی مستقل IP عمومی</h3>
              <p className="text-xs text-zinc-400 mt-1">تطابق همزمان نتایج سرور با کلودفلر و ipify برای جلوگیری از خطای تشخیصی</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#110f1a] border border-[#28233d] flex flex-col items-center text-center">
              <Server className="w-8 h-8 text-indigo-400 mb-3" />
              <h3 className="font-bold text-white text-sm">آزمایش واقعی نشت DNS</h3>
              <p className="text-xs text-zinc-400 mt-1">شناسایی ریزالورهای بازگشتی، بررسی DoH و تفکیک DNS محلی از سرویس‌های عمومی</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#110f1a] border border-[#28233d] flex flex-col items-center text-center">
              <Radio className="w-8 h-8 text-emerald-400 mb-3" />
              <h3 className="font-bold text-white text-sm">تحلیل کاندیدهای WebRTC</h3>
              <p className="text-xs text-zinc-400 mt-1">تفکیک تخصصی آدرس‌های خصوصی RFC 1918 از افشای واقعی IP با پروتکل STUN</p>
            </div>

            <div className="p-5 rounded-2xl bg-[#110f1a] border border-[#28233d] flex flex-col items-center text-center">
              <ShieldCheck className="w-8 h-8 text-amber-400 mb-3" />
              <h3 className="font-bold text-white text-sm">اعتبارسنجی سازگاری VPN</h3>
              <p className="text-xs text-zinc-400 mt-1">تشخیص نشت پروتکل دوگانه IPv6 و مغایرت منطقه زمانی سیستم با IP خروجی</p>
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="no-print border-t border-[#1b172a] bg-[#08070d] py-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>NetLeakGuard Pro v1.0.0 Enterprise</span>
            <span className="text-zinc-700">|</span>
            <span className="font-sans">پشتیبانی کامل از ویندوز ۱۰، ۱۱ و اندروید</span>
          </div>

          <div className="flex items-center gap-4 text-[11px] font-sans">
            <button onClick={() => setShowBuildGuideModal(true)} className="hover:text-violet-400 transition cursor-pointer">
              {t.buildGuide}
            </button>
            <span className="text-zinc-700">•</span>
            <button onClick={() => setShowSettingsModal(true)} className="hover:text-violet-400 transition cursor-pointer">
              {t.settings}
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {showEvidenceModal && report && (
        <EvidenceModal
          report={report}
          lang={lang}
          onClose={() => setShowEvidenceModal(false)}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          vpnConfig={vpnConfig}
          onSave={cfg => setVpnConfig(cfg)}
          lang={lang}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showBuildGuideModal && (
        <BuildGuideModal
          lang={lang}
          onClose={() => setShowBuildGuideModal(false)}
        />
      )}

      {showReportModal && report && (
        <ReportExportModal
          report={report}
          lang={lang}
          onClose={() => setShowReportModal(false)}
        />
      )}

    </div>
  );
}
