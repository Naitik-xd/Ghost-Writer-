/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { WorkspaceTab, Project } from '../types';
import { Archive, Compass, Cpu, FileText, Layers, Plus, ShieldCheck, Download } from 'lucide-react';

interface NavbarProps {
  currentTab: WorkspaceTab;
  onSelectTab: (tab: WorkspaceTab) => void;
  activeProject: Project | null;
  onNewProject: () => void;
  onExportBackup: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  activeProject,
  onNewProject,
  onExportBackup,
}) => {
  const tabs: Array<{ id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }> = [
    { id: 'desk', label: '01. Recovery Desk', icon: Compass },
    { id: 'vault', label: '02. Fragment Vault', icon: Layers },
    { id: 'intent', label: '03. Intent Map', icon: Cpu },
    { id: 'recovery', label: '04. Recovery Plan', icon: Archive },
    { id: 'studio', label: '05. Output Studio', icon: FileText },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark (Single text element) */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onSelectTab('desk')}
            className="flex items-center gap-2.5 text-left group transition-opacity hover:opacity-85"
          >
            <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold font-mono text-sm shadow-xs">
              G
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-slate-900 font-display">
                Ghostwriter
              </span>
              <span className="text-xs text-slate-500 font-normal ml-1.5 hidden sm:inline">
                for Reality
              </span>
            </div>
          </button>

          {activeProject && (
            <div className="hidden lg:flex items-center gap-2 pl-3 border-l border-slate-200 text-xs text-slate-500">
              <span className="font-medium text-slate-800 truncate max-w-[180px]">
                {activeProject.title}
              </span>
              {activeProject.isDemo && (
                <span className="text-[11px] font-mono text-indigo-600 bg-indigo-50/80 px-1.5 py-0.5 rounded">
                  Demo
                </span>
              )}
            </div>
          )}
        </div>

        {/* Zone 2: 5 Clean Single-Line Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 overflow-x-auto py-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onSelectTab(tab.id)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action & Local Backup */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onExportBackup}
            title="Export local IndexedDB workspace backup"
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Backup Data</span>
          </button>

          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:scale-[0.98] transition-all shadow-xs whitespace-nowrap"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Recover Project</span>
          </button>
        </div>
      </div>

      {/* Mobile Tab Strip */}
      <div className="md:hidden flex items-center justify-between border-t border-slate-200 px-2 py-1.5 bg-slate-50 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`px-2.5 py-1 text-[11px] font-medium whitespace-nowrap rounded ${
                isActive ? 'bg-slate-900 text-white font-semibold' : 'text-slate-600'
              }`}
            >
              {tab.label.split('. ')[1] || tab.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
