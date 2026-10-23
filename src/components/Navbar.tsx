/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkspaceTab, Project, GemmaRateLimitInfo } from '../types';
import { Archive, Compass, Cpu, FileText, Layers, Plus, Download, Zap } from 'lucide-react';

interface NavbarProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  activeProject?: Project | null;
  onNewProject: () => void;
  onExportBackup: () => void;
  rateLimitInfo?: GemmaRateLimitInfo | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  onNewProject,
  onExportBackup,
  rateLimitInfo,
}) => {
  const tabs: Array<{ id: WorkspaceTab; label: string; number: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'desk', label: 'Recovery Desk', number: '01', icon: Compass },
    { id: 'vault', label: 'Fragment Vault', number: '02', icon: Layers },
    { id: 'intent', label: 'Intent Map', number: '03', icon: Cpu },
    { id: 'recovery', label: 'Recovery Plan', number: '04', icon: Archive },
    { id: 'studio', label: 'Output Studio', number: '05', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs w-full overflow-hidden">
      {/* Level 1: Brand & Actions Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand Wordmark (Clean & Distinctive) */}
        <button
          onClick={() => onSelectTab('desk')}
          className="flex items-center gap-3 text-left group transition-all shrink-0"
          title="Ghostwriter for Reality - Home"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm shadow-xs group-hover:bg-indigo-600 transition-colors">
            G
          </div>
          <div className="flex flex-col">
            <span className="text-base sm:text-lg font-bold tracking-tight text-slate-900 font-display leading-tight group-hover:text-indigo-600 transition-colors">
              Ghostwriter
            </span>
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
              for Reality
            </span>
          </div>
        </button>

        {/* Right Actions & Quota */}
        <div className="flex items-center gap-2.5 shrink-0">
          {rateLimitInfo && (
            <div
              title={`Gemma 4 Quota: ${rateLimitInfo.remaining} / ${rateLimitInfo.limit} requests available in current 5-hour window`}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono bg-slate-100 text-slate-700 rounded-lg border border-slate-200/80"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-600" />
              <span>Gemma 4: {rateLimitInfo.remaining}/{rateLimitInfo.limit}</span>
            </div>
          )}

          <button
            onClick={onExportBackup}
            title="Export full workspace data as JSON"
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors shadow-2xs whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">Backup Data</span>
            <span className="sm:hidden">Backup</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>Recover Project</span>
          </button>
        </div>
      </div>

      {/* Level 2: Big, Prominent, Roomy Workspace Tab Navigator */}
      <div className="border-t border-slate-100 bg-slate-50/70 py-2 px-3 sm:px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-1.5 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 sm:gap-2.5 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs font-bold scale-[1.01]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 bg-white/70 border border-slate-200/60'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 transition-colors ${isActive ? 'text-indigo-400' : 'text-slate-400'}`} />
                <span className="hidden md:inline text-[11px] font-mono opacity-60 font-normal">
                  {tab.number}
                </span>
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
