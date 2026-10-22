/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Project } from '../types';
import { 
  FolderGit2, 
  Plus, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Trash2, 
  ArrowRight, 
  Upload, 
  Layers, 
  FileCheck,
  AlertCircle
} from 'lucide-react';

interface RecoveryDeskProps {
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (id: string) => void;
  onNewProject: () => void;
  onLoadDemoProject: () => void;
  onDeleteProject: (id: string) => void;
  onImportBackup: (file: File) => void;
}

export const RecoveryDesk: React.FC<RecoveryDeskProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onNewProject,
  onLoadDemoProject,
  onDeleteProject,
  onImportBackup,
}) => {
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onImportBackup(e.target.files[0]);
      e.target.value = '';
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 tracking-wide uppercase mb-3">
            <span>Project Archaeology Engine</span>
            <span aria-hidden="true">·</span>
            <span>Gemma 4 Powered</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-display mb-3">
            From scattered fragments to finished work.
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed mb-6">
            Recover abandoned repositories, half-finished specs, and napkin notes. Ghostwriter extracts text with client-side OCR verification, reconstructs project intent with Gemma 4, links decisions directly to source evidence, and delivers an immediate recovery sprint plan.
          </p>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onNewProject}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Recover New Project</span>
            </button>

            <button
              onClick={onLoadDemoProject}
              className="flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200/70 rounded-lg hover:bg-indigo-100/70 transition-colors shadow-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Explore Stalled Example (HyperLocal P2P)</span>
            </button>

            <label className="flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 hover:text-slate-900 cursor-pointer transition-colors">
              <Upload className="w-3.5 h-3.5" />
              <span>Import JSON Backup</span>
              <input type="file" accept=".json" onChange={handleFileChange} className="hidden" />
            </label>
          </div>
        </div>
      </div>

      {/* Local Storage & Privacy Transparency Notice */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-slate-900 mb-0.5">
              100% Local-First Storage (IndexedDB)
            </h4>
            <p className="text-xs text-slate-600 leading-normal max-w-3xl">
              Your notes, images, and fragments are preserved inside your browser’s IndexedDB sandbox. OCR extraction runs entirely on your device via client-side Tesseract.js. Text is sent to Gemma 4 only when you explicitly run Intent Reconstruction or Output Generation.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 font-mono shrink-0 pl-12 sm:pl-0">
          Quota Safe · Zero Account Needed
        </div>
      </div>

      {/* Projects Portfolio Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-display">
              Saved Recovery Projects
            </h2>
            <p className="text-xs text-slate-500">
              {projects.length} {projects.length === 1 ? 'project' : 'projects'} stored locally in IndexedDB
            </p>
          </div>
        </div>

        {projects.length === 0 ? (
          <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 text-center bg-white">
            <FolderGit2 className="w-10 h-10 text-slate-400 mx-auto mb-3" />
            <h3 className="text-sm font-semibold text-slate-900 mb-1">
              No saved recovery projects yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Start by recovering an abandoned project from scratch, or load our realistic sample project to see how Gemma 4 reconstructs stalled intent.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={onNewProject}
                className="px-4 py-2 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
              >
                Recover First Project
              </button>
              <button
                onClick={onLoadDemoProject}
                className="px-4 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors"
              >
                Load Stalled Example
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => {
              const isSelected = activeProjectId === project.id;
              const formattedDate = new Date(project.updatedAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <div
                  key={project.id}
                  onClick={() => onSelectProject(project.id)}
                  className={`group relative bg-white border rounded-xl p-5 transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-indigo-600 ring-2 ring-indigo-500/10 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500">
                        {project.category || 'General Project'}
                      </span>
                      {project.isDemo && (
                        <span className="text-[10px] font-semibold font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                          Sample Project
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-bold text-slate-900 font-display mb-1.5 group-hover:text-indigo-600 transition-colors">
                      {project.title}
                    </h3>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4">
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formattedDate}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded transition-colors"
                        title="Delete project"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <span className="flex items-center gap-1 font-medium text-indigo-600 group-hover:translate-x-0.5 transition-transform">
                        <span>Open Vault</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (Safeguard) */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in duration-150">
            <div className="w-10 h-10 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 font-display mb-2">
              Permanently delete "{projectToDelete.title}"?
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed mb-6">
              This will remove the project, all stored fragments, OCR extractions, and deliverables from your local IndexedDB database. This action cannot be undone unless you have an exported backup.
            </p>
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProject(projectToDelete.id);
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors"
              >
                Delete Project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
