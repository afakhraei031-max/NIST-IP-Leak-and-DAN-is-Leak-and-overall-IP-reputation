/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Smartphone, Laptop, Server, Key, Layers, Terminal, Copy, Check, ExternalLink } from 'lucide-react';
import { Language } from '../types/index.ts';
import { STRINGS } from '../locales/strings.ts';

interface BuildGuideModalProps {
  lang: Language;
  onClose: () => void;
}

export const BuildGuideModal: React.FC<BuildGuideModalProps> = ({ lang, onClose }) => {
  const t = STRINGS[lang];
  const [activeTab, setActiveTab] = useState<'android' | 'windows' | 'dns-backend' | 'services'>('android');
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08070d]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#110f1a] border border-[#28233d] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#231e36] flex items-center justify-between bg-[#090810]/70">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-violet-400" />
            <div>
              <h3 className="font-bold text-white text-base sm:text-lg">
                {lang === 'fa' ? 'راهنمای جامع ساخت ویندوز، اندروید و بک‌اند DNS' : 'Cross-Platform Build & Architecture Guide'}
              </h3>
              <p className="text-xs text-zinc-400">
                {lang === 'fa'
                  ? 'مستندات مهندسی برای ایجاد فایل نصبی APK اندروید، بسته ویندوز ۱۰/۱۱ و سرور اختصاصی DNS'
                  : 'Engineering docs for Android APK, Windows 10/11 installer, and DNS backend deployment'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#221d36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[#231e36] px-6 gap-2 bg-[#0d0b14] overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('android')}
            className={`py-3 px-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'android'
                ? 'border-emerald-400 text-emerald-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>{lang === 'fa' ? 'ساخت APK اندروید' : 'Android APK Build'}</span>
          </button>

          <button
            onClick={() => setActiveTab('windows')}
            className={`py-3 px-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'windows'
                ? 'border-violet-400 text-violet-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Laptop className="w-4 h-4" />
            <span>{lang === 'fa' ? 'ساخت برنامه ویندوز ۱۰ و ۱۱' : 'Windows 10/11 Executable'}</span>
          </button>

          <button
            onClick={() => setActiveTab('dns-backend')}
            className={`py-3 px-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'dns-backend'
                ? 'border-purple-400 text-purple-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Server className="w-4 h-4" />
            <span>{lang === 'fa' ? 'راه‌اندازی بک‌اند DNS اختصاصی' : 'DNS Authoritative Backend'}</span>
          </button>

          <button
            onClick={() => setActiveTab('services')}
            className={`py-3 px-3 font-medium border-b-2 transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'services'
                ? 'border-amber-400 text-amber-300'
                : 'border-transparent text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>{lang === 'fa' ? 'سرویس‌های خارجی و محدودیت‌ها' : 'External Services & Quotas'}</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm text-zinc-300 leading-relaxed">
          
          {/* TAB 1: Android APK */}
          {activeTab === 'android' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-900/50">
                <h4 className="font-bold text-emerald-300 mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? 'روش استاندارد ساخت فایل APK و AAB اندروید با Capacitor' : 'Standard Android APK Build with Capacitor'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {lang === 'fa'
                    ? 'پروژه فعلی با استفاده از معماری ماژولار React + TypeScript ساخته شده و به راحتی با موتور بومی Capacitor به اپلیکیشن بومی اندروید تبدیل می‌شود که دسترسی کامل به سخت‌افزار شبکه، WebRTC بومی و سنسورها را فراهم می‌آورد.'
                    : 'The project can be bundled directly into native Android using Capacitor.'}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-200">
                  {lang === 'fa' ? 'گام ۱: نصب پیش‌نیازهای Capacitor و بیلد وب' : 'Step 1: Install Capacitor & Build'}
                </h5>
                <div className="relative bg-[#090810] p-4 rounded-xl border border-[#231e36] font-mono text-xs overflow-x-auto" dir="ltr">
                  <button
                    onClick={() => copyToClipboard('npm run build\nnpm install @capacitor/core @capacitor/cli @capacitor/android\nnpx cap init "NetLeakGuard Pro" "com.netleakguard.app" --web-dir dist\nnpx cap add android', 'c1')}
                    className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-emerald-400 transition bg-[#181426] p-1.5 rounded-lg border border-[#282245]"
                    title={t.copy}
                  >
                    {copiedCode === 'c1' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-emerald-300">
{`npm run build
npm install @capacitor/core @capacitor/cli @capacitor/android
npx cap init "NetLeakGuard Pro" "com.netleakguard.app" --web-dir dist
npx cap add android`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-200">
                  {lang === 'fa' ? 'گام ۲: اضافه کردن دسترسی‌های شبکه در AndroidManifest.xml' : 'Step 2: Network Permissions in AndroidManifest.xml'}
                </h5>
                <div className="relative bg-[#090810] p-4 rounded-xl border border-[#231e36] font-mono text-xs overflow-x-auto" dir="ltr">
                  <button
                    onClick={() => copyToClipboard('<uses-permission android:name="android.permission.INTERNET" />\n<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />\n<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />', 'c2')}
                    className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-emerald-400 transition bg-[#181426] p-1.5 rounded-lg border border-[#282245]"
                    title={t.copy}
                  >
                    {copiedCode === 'c2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-violet-300">
{`<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-200">
                  {lang === 'fa' ? 'گام ۳: ساخت فایل نهایی APK در Android Studio یا خط فرمان' : 'Step 3: Assemble APK'}
                </h5>
                <div className="relative bg-[#090810] p-4 rounded-xl border border-[#231e36] font-mono text-xs overflow-x-auto" dir="ltr">
                  <button
                    onClick={() => copyToClipboard('npx cap sync android\ncd android\n./gradlew assembleRelease', 'c3')}
                    className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-emerald-400 transition bg-[#181426] p-1.5 rounded-lg border border-[#282245]"
                    title={t.copy}
                  >
                    {copiedCode === 'c3' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-emerald-300">
{`npx cap sync android
cd android
./gradlew assembleRelease`}
                  </pre>
                </div>
                <p className="text-zinc-400 text-xs">
                  فایل خروجی APK در مسیر <code className="text-zinc-200 font-mono">android/app/build/outputs/apk/release/app-release.apk</code> تولید می‌گردد.
                </p>
              </div>
            </div>
          )}

          {/* TAB 2: Windows Executable */}
          {activeTab === 'windows' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-900/50">
                <h4 className="font-bold text-violet-300 mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? 'ساخت نرم‌افزار قابل نصب ویندوز ۱۰ و ۱۱ (Electron / MSIX)' : 'Build Windows 10/11 App (Electron & Installer)'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {lang === 'fa'
                    ? 'برای ویندوز می‌توانید از Electron یا Tauri استفاده نمایید. پکیج نهایی به عنوان فایل نصبی Setup.exe یا پرتابل خروجی داده می‌شود.'
                    : 'Use Electron or Tauri to compile a native Windows exe installer.'}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-200">
                  {lang === 'fa' ? 'گام ۱: نصب Electron و electron-builder' : 'Step 1: Install Electron Tooling'}
                </h5>
                <div className="relative bg-[#090810] p-4 rounded-xl border border-[#231e36] font-mono text-xs overflow-x-auto" dir="ltr">
                  <button
                    onClick={() => copyToClipboard('npm install --save-dev electron electron-builder concurrently wait-on', 'w1')}
                    className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-violet-400 transition bg-[#181426] p-1.5 rounded-lg border border-[#282245]"
                    title={t.copy}
                  >
                    {copiedCode === 'w1' ? <Check className="w-4 h-4 text-violet-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-violet-300">
{`npm install --save-dev electron electron-builder concurrently wait-on`}
                  </pre>
                </div>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-200">
                  {lang === 'fa' ? 'گام ۲: دستور ساخت خروجی ویندوز' : 'Step 2: Package Windows Executable'}
                </h5>
                <div className="relative bg-[#090810] p-4 rounded-xl border border-[#231e36] font-mono text-xs overflow-x-auto" dir="ltr">
                  <button
                    onClick={() => copyToClipboard('npm run build\nnpx electron-builder --win nsis --x64', 'w2')}
                    className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-violet-400 transition bg-[#181426] p-1.5 rounded-lg border border-[#282245]"
                    title={t.copy}
                  >
                    {copiedCode === 'w2' ? <Check className="w-4 h-4 text-violet-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-violet-300">
{`npm run build
npx electron-builder --win nsis --x64`}
                  </pre>
                </div>
                <p className="text-zinc-400 text-xs">
                  بسته نصب ویندوز در پوشه <code className="text-zinc-200 font-mono">dist/NetLeakGuard-Pro-Setup.exe</code> ایجاد شده و آماده نصب روی Windows 10 و Windows 11 می‌باشد.
                </p>
              </div>
            </div>
          )}

          {/* TAB 3: DNS Backend */}
          {activeTab === 'dns-backend' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-purple-950/30 border border-purple-900/50">
                <h4 className="font-bold text-purple-300 mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? 'معماری و راه‌اندازی سرور اختصاصی DNS Authoritative' : 'Authoritative DNS Backend Architecture'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {lang === 'fa'
                    ? 'برای اجرای تست ۱۰۰٪ اختصاصی DNS Leak بدون اتکا به سرویس‌های اشتراکی، یک سرور Name Server (مانند CoreDNS یا Node.js dgram UDP) راه‌اندازی می‌شود. با ایجاد توکن تصادفی به عنوان ساب‌دومین، سرور دقیقاً IP مبدا ریزالوری که درخواست را فرستاده است لاگ می‌کند.'
                    : 'Custom authoritative DNS logger captures resolver egress IP.'}
                </p>
              </div>

              <div className="space-y-2">
                <h5 className="font-semibold text-zinc-200">
                  {lang === 'fa' ? 'کد سرور تستی Node.js با سوکت UDP پورت ۵۳ (dns_server.js)' : 'Core UDP DNS Server Script (Port 53)'}
                </h5>
                <div className="relative bg-[#090810] p-4 rounded-xl border border-[#231e36] font-mono text-xs overflow-x-auto" dir="ltr">
                  <button
                    onClick={() => copyToClipboard(`import dgram from 'node:dgram';
const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  // rinfo.address gives the EXACT resolver IP contacting authoritative NS
  console.log(\`[DNS Query] From: \${rinfo.address}:\${rinfo.port}\`);
  // Record token and resolver IP to Redis / In-memory map
});

server.bind(53, '0.0.0.0', () => {
  console.log('Authoritative DNS Leak Listener active on UDP 53');
});`, 'd1')}
                    className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-purple-400 transition bg-[#181426] p-1.5 rounded-lg border border-[#282245]"
                    title={t.copy}
                  >
                    {copiedCode === 'd1' ? <Check className="w-4 h-4 text-purple-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                  <pre className="text-purple-300">
{`import dgram from 'node:dgram';
const server = dgram.createSocket('udp4');

server.on('message', (msg, rinfo) => {
  // rinfo.address gives the EXACT resolver IP contacting authoritative NS
  console.log(\`[DNS Query] From: \${rinfo.address}:\${rinfo.port}\`);
});

server.bind(53, '0.0.0.0', () => {
  console.log('Authoritative DNS Leak Listener active on UDP 53');
});`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: External Services */}
          {activeTab === 'services' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-900/50">
                <h4 className="font-bold text-amber-300 mb-1 text-sm sm:text-base">
                  {lang === 'fa' ? 'فهرست سرویس‌های خارجی، سهمیه‌ها و محدودیت‌ها' : 'External Services, Quotas & Limits'}
                </h4>
                <p className="text-zinc-400 text-xs">
                  {lang === 'fa'
                    ? 'تمامی سرویس‌های مورد استفاده در این برنامه معتبر، رایگان یا استاندارد صنعتی هستند و بدون افشای حریم خصوصی کاربر عمل می‌کنند.'
                    : 'All third-party services utilized have transparent quotas.'}
                </p>
              </div>

              <div className="divide-y divide-[#231e36] bg-[#090810]/80 rounded-xl border border-[#231e36] overflow-hidden text-xs">
                <div className="p-3">
                  <div className="font-bold text-violet-300">Cloudflare Edge & Trace (1.1.1.1)</div>
                  <div className="text-zinc-400 mt-0.5">کاربرد: تشخیص سریع IP عمومی و DoH | سهمیه: نامحدود و رایگان | محدودیت: نیاز به دسترسی مستقیم اینترنت</div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-emerald-300">ipwhois.io & ipapi.co</div>
                  <div className="text-zinc-400 mt-0.5">کاربرد: استخراج کشور، شهر، نام ISP، شماره ASN و منطقه زمانی | سهمیه: ۱۰,۰۰۰ درخواست ماهانه رایگان | محدودیت: عدم ارائه موقعیت GPS دقیق</div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-purple-300">Google & Cloudflare STUN Servers</div>
                  <div className="text-zinc-400 mt-0.5">کاربرد: بررسی بازتاب کاندیدهای WebRTC ICE | سهمیه: رایگان عمومی | پورت‌ها: 19302 و 3478 UDP</div>
                </div>
                <div className="p-3">
                  <div className="font-bold text-amber-300">Google DoH (dns.google)</div>
                  <div className="text-zinc-400 mt-0.5">کاربرد: آزمایش تفکیک امن DNS بر بستر HTTPS | سهمیه: رایگان استاندارد</div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-[#231e36] bg-[#090810]/70 flex justify-end">
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
