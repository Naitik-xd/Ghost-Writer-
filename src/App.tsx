/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Project, 
  Fragment, 
  Deliverable, 
  WorkspaceTab, 
  IntentReconstruction, 
  RecoveryPlan 
} from './types';
import { storage } from './services/storage';
import { 
  DEMO_PROJECT, 
  DEMO_FRAGMENTS, 
  DEMO_INTENT, 
  DEMO_RECOVERY_PLAN 
} from './data/demoProject';
import { reconstructIntentWithGemma } from './services/gemma';

import { Navbar } from './components/Navbar';
import { RecoveryDesk } from './components/RecoveryDesk';
import { FragmentVault } from './components/FragmentVault';
import { IntentMap } from './components/IntentMap';
import { RecoveryPlanView } from './components/RecoveryPlanView';
import { OutputStudio } from './components/OutputStudio';

import { X, CheckCircle, AlertCircle } from 'lucide-react';

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [currentTab, setCurrentTab] = useState<WorkspaceTab>('desk');

  const [fragments, setFragments] = useState<Fragment[]>([]);
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [intent, setIntent] = useState<IntentReconstruction | null>(null);
  const [recoveryPlan, setRecoveryPlan] = useState<RecoveryPlan | null>(null);

  // Status & Notifications
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // New Project Modal State
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');

  // Initial Data Load & Seeding
  useEffect(() => {
    async function initWorkspace() {
      try {
        const loadedProjects = await storage.getProjects();
        if (loadedProjects.length === 0) {
          // Seed initial demo project for immediate exploration
          await storage.saveProject(DEMO_PROJECT);
          for (const frag of DEMO_FRAGMENTS) {
            await storage.saveFragment(frag);
          }
          setProjects([DEMO_PROJECT]);
          setActiveProjectId(DEMO_PROJECT.id);
        } else {
          setProjects(loadedProjects);
          setActiveProjectId(loadedProjects[0].id);
        }
      } catch (err) {
        console.error('Failed to initialize storage:', err);
        showToast('Error loading local storage.', 'error');
      }
    }
    initWorkspace();
  }, []);

  // Sync state whenever active project changes
  useEffect(() => {
    async function loadProjectContext() {
      if (!activeProjectId) {
        setFragments([]);
        setDeliverables([]);
        setIntent(null);
        setRecoveryPlan(null);
        return;
      }

      const active = projects.find((p) => p.id === activeProjectId);

      try {
        const frags = await storage.getFragments(activeProjectId);
        const delivs = await storage.getDeliverables(activeProjectId);

        setFragments(frags);
        setDeliverables(delivs);

        // If this is the demo project and no custom intent saved, use demo intent
        if (active?.intent) {
          setIntent(active.intent);
        } else if (activeProjectId === DEMO_PROJECT.id) {
          setIntent(DEMO_INTENT);
        } else {
          setIntent(null);
        }

        if (active?.recoveryPlan) {
          setRecoveryPlan(active.recoveryPlan);
        } else if (activeProjectId === DEMO_PROJECT.id) {
          setRecoveryPlan(DEMO_RECOVERY_PLAN);
        } else {
          setRecoveryPlan(null);
        }
      } catch (err) {
        console.error('Error loading project context:', err);
      }
    }

    loadProjectContext();
  }, [activeProjectId, projects]);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3000);
  };

  const activeProject = projects.find((p) => p.id === activeProjectId) || null;

  // Handlers
  const handleSelectProject = (id: string) => {
    setActiveProjectId(id);
    setCurrentTab('vault');
  };

  const handleCreateProject = async () => {
    if (!newTitle.trim()) return;

    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory.trim() || 'General Workspace',
      description: newDescription.trim(),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    await storage.saveProject(newProj);
    const updated = [newProj, ...projects];
    setProjects(updated);
    setActiveProjectId(newProj.id);
    setCurrentTab('vault');

    setNewTitle('');
    setNewCategory('');
    setNewDescription('');
    setIsNewProjectModalOpen(false);
    showToast(`Project "${newProj.title}" created locally.`);
  };

  const handleLoadDemoProject = async () => {
    await storage.saveProject(DEMO_PROJECT);
    for (const f of DEMO_FRAGMENTS) {
      await storage.saveFragment(f);
    }
    const filtered = projects.filter((p) => p.id !== DEMO_PROJECT.id);
    setProjects([DEMO_PROJECT, ...filtered]);
    setActiveProjectId(DEMO_PROJECT.id);
    setCurrentTab('intent');
    showToast('Loaded sample project: HyperLocal Peer Sync.');
  };

  const handleDeleteProject = async (id: string) => {
    await storage.deleteProject(id);
    const remaining = projects.filter((p) => p.id !== id);
    setProjects(remaining);
    if (activeProjectId === id) {
      setActiveProjectId(remaining[0]?.id || null);
      setCurrentTab('desk');
    }
    showToast('Project deleted from IndexedDB.');
  };

  const handleSaveFragment = async (fragment: Fragment) => {
    await storage.saveFragment(fragment);
    const updated = fragments.filter((f) => f.id !== fragment.id).concat(fragment);
    setFragments(updated);
    showToast(`Fragment "${fragment.title}" saved.`);
  };

  const handleDeleteFragment = async (id: string) => {
    await storage.deleteFragment(id);
    setFragments(fragments.filter((f) => f.id !== id));
    showToast('Fragment deleted.');
  };

  const handleReconstructIntent = async () => {
    if (!activeProjectId || fragments.length === 0) return;

    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const result = await reconstructIntentWithGemma(activeProjectId, fragments);
      setIntent(result.intent);
      setRecoveryPlan(result.recoveryPlan);

      // Persist to current project
      if (activeProject) {
        const updatedProj = {
          ...activeProject,
          intent: result.intent,
          recoveryPlan: result.recoveryPlan,
          updatedAt: Date.now(),
        };
        await storage.saveProject(updatedProj);
        setProjects(projects.map((p) => (p.id === activeProjectId ? updatedProj : p)));
      }

      setIsAnalyzing(false);
      showToast('Intent and recovery plan successfully reconstructed by Gemma 4.');
    } catch (err: any) {
      console.error('Gemma reconstruction error:', err);
      setAnalysisError(err.message || 'Gemma 4 reconstruction failed.');
      setIsAnalyzing(false);
    }
  };

  const handleToggleAssumption = async (assumptionId: string, confirmed: boolean) => {
    if (!intent || !activeProject) return;

    const updatedAssumptions = intent.assumptions.map((a) =>
      a.id === assumptionId ? { ...a, userConfirmed: confirmed } : a
    );

    const updatedIntent = {
      ...intent,
      assumptions: updatedAssumptions,
    };

    setIntent(updatedIntent);
    const updatedProj = { ...activeProject, intent: updatedIntent };
    await storage.saveProject(updatedProj);
    setProjects(projects.map((p) => (p.id === activeProjectId ? updatedProj : p)));
  };

  const handleUpdateRecoveryPlan = async (updatedPlan: RecoveryPlan) => {
    if (!activeProject) return;
    setRecoveryPlan(updatedPlan);
    const updatedProj = { ...activeProject, recoveryPlan: updatedPlan };
    await storage.saveProject(updatedProj);
    setProjects(projects.map((p) => (p.id === activeProjectId ? updatedProj : p)));
  };

  const handleSaveDeliverable = async (deliverable: Deliverable) => {
    await storage.saveDeliverable(deliverable);
    const updated = deliverables.filter((d) => d.id !== deliverable.id).concat(deliverable);
    setDeliverables(updated);
    showToast('Deliverable updated.');
  };

  const handleExportWorkspaceBackup = async () => {
    try {
      const jsonBackup = await storage.exportFullBackup();
      const blob = new Blob([jsonBackup], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ghostwriter-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      showToast('Workspace backup exported successfully.');
    } catch (err: any) {
      showToast('Failed to export backup: ' + err.message, 'error');
    }
  };

  const handleImportBackupFile = async (file: File) => {
    try {
      const text = await file.text();
      const result = await storage.importFullBackup(text);
      const updatedProjects = await storage.getProjects();
      setProjects(updatedProjects);
      if (updatedProjects.length > 0) {
        setActiveProjectId(updatedProjects[0].id);
      }
      showToast(`Backup restored: ${result.projectsCount} projects and ${result.fragmentsCount} fragments.`);
    } catch (err: any) {
      showToast('Import error: ' + err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-tech-grid flex flex-col text-slate-900 font-sans">
      {/* 3-Zone Top Navigation Contract */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        activeProject={activeProject}
        onNewProject={() => setIsNewProjectModalOpen(true)}
        onExportBackup={handleExportWorkspaceBackup}
      />

      {/* Main Workspace View Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {currentTab === 'desk' && (
          <RecoveryDesk
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={handleSelectProject}
            onNewProject={() => setIsNewProjectModalOpen(true)}
            onLoadDemoProject={handleLoadDemoProject}
            onDeleteProject={handleDeleteProject}
            onImportBackup={handleImportBackupFile}
          />
        )}

        {currentTab === 'vault' && (
          <FragmentVault
            fragments={fragments}
            projectId={activeProjectId || ''}
            projectTitle={activeProject?.title || 'Untitled Project'}
            onSaveFragment={handleSaveFragment}
            onDeleteFragment={handleDeleteFragment}
            onProceedToIntentMap={() => setCurrentTab('intent')}
          />
        )}

        {currentTab === 'intent' && (
          <IntentMap
            intent={intent}
            fragments={fragments}
            projectTitle={activeProject?.title || 'Untitled Project'}
            isAnalyzing={isAnalyzing}
            analysisError={analysisError}
            onReconstruct={handleReconstructIntent}
            onToggleAssumption={handleToggleAssumption}
            onProceedToRecoveryPlan={() => setCurrentTab('recovery')}
          />
        )}

        {currentTab === 'recovery' && (
          <RecoveryPlanView
            plan={recoveryPlan}
            projectTitle={activeProject?.title || 'Untitled Project'}
            onUpdatePlan={handleUpdateRecoveryPlan}
            onProceedToOutputStudio={() => setCurrentTab('studio')}
          />
        )}

        {currentTab === 'studio' && (
          <OutputStudio
            deliverables={deliverables}
            projectId={activeProjectId || ''}
            projectTitle={activeProject?.title || 'Untitled Project'}
            intent={intent}
            fragments={fragments}
            onSaveDeliverable={handleSaveDeliverable}
          />
        )}
      </main>

      {/* Recover New Project Modal */}
      {isNewProjectModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-md w-full p-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <h3 className="text-base font-bold text-slate-900 font-display">
                Recover Project
              </h3>
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Distributed Mesh Router"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Category or Domain
                </label>
                <input
                  type="text"
                  placeholder="e.g. Networking, Mobile, Embedded"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Initial Summary / Context
                </label>
                <textarea
                  rows={3}
                  placeholder="Where was this project left off? What was the intended purpose?"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 mt-6">
              <button
                onClick={() => setIsNewProjectModalOpen(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!newTitle.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
              >
                Start Recovery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action / Toast Message */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-xs shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}
    </div>
  );
}
