/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { X, Settings, Shield, Globe, Save } from 'lucide-react';
import { UserVpnConfig, Language } from '../types/index.ts';
import { STRINGS } from '../locales/strings.ts';

interface SettingsModalProps {
  vpnConfig: UserVpnConfig;
  onSave: (config: UserVpnConfig) => void;
  lang: Language;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  vpnConfig,
  onSave,
  lang,
  onClose
}) => {
  const t = STRINGS[lang];
  const [isVpnExpectedActive, setIsVpnExpectedActive] = useState(vpnConfig.isVpnExpectedActive);
  const [expectedCountryCode, setExpectedCountryCode] = useState(vpnConfig.expectedCountryCode || '');
  const [expectedIpPrefix, setExpectedIpPrefix] = useState(vpnConfig.expectedIpPrefix || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      isVpnExpectedActive,
      expectedCountryCode: expectedCountryCode.trim().toUpperCase() || undefined,
      expectedIpPrefix: expectedIpPrefix.trim() || undefined
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#08070d]/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#110f1a] border border-[#28233d] w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#231e36] flex items-center justify-between bg-[#090810]/70">
          <div className="flex items-center gap-3">
            <Settings className="w-5 h-5 text-violet-400" />
            <h3 className="font-bold text-white text-base">
              {lang === 'fa' ? 'تنظیمات اعتبارسنجی شبکه و VPN' : 'VPN & Network Audit Settings'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-[#221d36] transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs sm:text-sm">
          
          {/* Active VPN toggle */}
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-[#090810]/90 border border-[#231e36]">
            <div className="space-y-0.5">
              <label htmlFor="vpn-toggle" className="font-semibold text-zinc-200 block cursor-pointer">
                {lang === 'fa' ? 'انتظار اتصال فعال VPN / پروکسی' : 'Expected Active VPN Connection'}
              </label>
              <p className="text-xs text-zinc-400">
                {lang === 'fa'
                  ? 'در صورت فعال بودن، موتور نرم‌افزار خروجی‌ها را با سرور VPN مقایسه کرده و در صورت افشای IP بومی هشدار نشت صادر می‌کند.'
                  : 'Checks if connection matches VPN exit and flags origin leaks.'}
              </p>
            </div>
            <input
              id="vpn-toggle"
              type="checkbox"
              checked={isVpnExpectedActive}
              onChange={e => setIsVpnExpectedActive(e.target.checked)}
              className="w-5 h-5 rounded text-violet-600 focus:ring-violet-500 bg-[#1d192d] border-[#332c4d] cursor-pointer"
            />
          </div>

          {/* Expected Country Code */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 block">
              {lang === 'fa' ? 'کد کشور مورد انتظار سرور VPN (دو حرفی مانند DE, US, NL, FR)' : 'Expected VPN Country Code (e.g. DE, US, NL)'}
            </label>
            <div className="relative">
              <Globe className="w-4 h-4 text-zinc-500 absolute top-3 right-3 pointer-events-none" />
              <input
                type="text"
                maxLength={3}
                placeholder="DE"
                value={expectedCountryCode}
                onChange={e => setExpectedCountryCode(e.target.value.toUpperCase())}
                className="w-full bg-[#090810] border border-[#231e36] rounded-xl px-9 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono uppercase"
              />
            </div>
            <p className="text-[11px] text-zinc-400">
              {lang === 'fa'
                ? 'در صورت مشخص کردن، اگر کشور IP یا DNS با این کد مغایرت داشته باشد گزارش هشدار ثبت خواهد شد.'
                : 'Triggers alert if detected IP country differs.'}
            </p>
          </div>

          {/* Expected IP Prefix */}
          <div className="space-y-1.5">
            <label className="font-semibold text-zinc-300 block">
              {lang === 'fa' ? 'پیش‌شماره IP مورد انتظار سرور (اختیاری، مثلا 185.220.)' : 'Expected IP Prefix (Optional, e.g. 185.220.)'}
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-zinc-500 absolute top-3 right-3 pointer-events-none" />
              <input
                type="text"
                placeholder="185.220."
                value={expectedIpPrefix}
                onChange={e => setExpectedIpPrefix(e.target.value)}
                className="w-full bg-[#090810] border border-[#231e36] rounded-xl px-9 py-2.5 text-zinc-100 placeholder-zinc-600 focus:outline-none focus:border-violet-500 font-mono"
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="pt-3 border-t border-[#231e36] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-[#1e1933] hover:bg-[#282245] text-zinc-300 text-xs font-medium transition"
            >
              {t.close}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition shadow-lg shadow-violet-600/25"
            >
              <Save className="w-4 h-4" />
              <span>{lang === 'fa' ? 'ذخیره تنظیمات' : 'Save Settings'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
