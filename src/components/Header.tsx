/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ShieldCheck, ShieldAlert, Settings, BookOpen, Globe2, Laptop, Smartphone } from 'lucide-react';
import { STRINGS } from '../locales/strings.ts';
import { Language } from '../types/index.ts';

interface HeaderProps {
  lang: Language;
  onToggleLang: () => void;
  onOpenSettings: () => void;
  onOpenBuildGuide: () => void;
  isTesting: boolean;
  hasRunTest: boolean;
  hasLeak: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  lang,
  onToggleLang,
  onOpenSettings,
  onOpenBuildGuide,
  isTesting,
  hasRunTest,
  hasLeak
}) => {
  const t = STRINGS[lang];

  return (
    <header className="no-print border-b border-[#28233d] bg-[#110f1a]/95 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Brand & Title */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 shadow-lg shadow-violet-600/25 text-white">
            {hasLeak ? (
              <ShieldAlert className="w-6 h-6 text-amber-300 animate-pulse" />
            ) : (
              <ShieldCheck className="w-6 h-6 text-emerald-300" />
            )}
            <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isTesting ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${isTesting ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white font-mono">
                {t.appTitle}
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-violet-950/80 text-violet-300 border border-violet-800/60 font-medium">
                {t.appBadge}
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-0.5">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Platform Targets & Navigation Action Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Windows & Android Badges */}
          <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#1a1727] border border-[#2d2845] text-xs text-zinc-300 font-mono">
            <Laptop className="w-3.5 h-3.5 text-violet-400" />
            <span>Win 10/11</span>
            <span className="text-zinc-600">|</span>
            <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
            <span>Android</span>
          </div>

          {/* Build Guide Modal */}
          <button
            onClick={onOpenBuildGuide}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1727] hover:bg-[#252038] text-zinc-200 text-xs font-medium border border-[#2d2845] transition"
            title={t.buildGuide}
          >
            <BookOpen className="w-3.5 h-3.5 text-violet-400" />
            <span>{t.buildGuide}</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={onOpenSettings}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a1727] hover:bg-[#252038] text-zinc-200 text-xs font-medium border border-[#2d2845] transition"
            title={t.settings}
          >
            <Settings className="w-3.5 h-3.5 text-zinc-400" />
            <span>{t.settings}</span>
          </button>

          {/* Language Toggle */}
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#1a1727] hover:bg-[#252038] text-violet-400 text-xs font-medium border border-[#2d2845] transition font-mono"
            title={t.language}
          >
            <Globe2 className="w-3.5 h-3.5" />
            <span>{lang === 'fa' ? 'English' : 'فارسی'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
