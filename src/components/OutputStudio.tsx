/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Deliverable, IntentReconstruction, Fragment } from '../types';
import { assistTextWithGemma, generateDeliverableWithGemma } from '../services/gemma';
import { 
  FileText, 
  Sparkles, 
  Download, 
  Copy, 
  Check, 
  History, 
  RefreshCw, 
  AlertTriangle, 
  ArrowRight,
  Maximize2,
  CheckCircle2,
  XCircle,
  FileCode
} from 'lucide-react';

interface OutputStudioProps {
  deliverables: Deliverable[];
  projectId: string;
  projectTitle: string;
  intent: IntentReconstruction | null;
  fragments: Fragment[];
  onSaveDeliverable: (deliverable: Deliverable) => Promise<void>;
}

export const OutputStudio: React.FC<OutputStudioProps> = ({
  deliverables,
  projectId,
  projectTitle,
  intent,
  fragments,
  onSaveDeliverable,
}) => {
  const [selectedType, setSelectedType] = useState<'project_brief' | 'sprint_roadmap'>('project_brief');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Assistance State
  const [isAssisting, setIsAssisting] = useState(false);
  const [assistInstruction, setAssistInstruction] = useState<'continue' | 'expand' | 'clarify' | 'polish' | 'questions'>('continue');
  const [activeSuggestion, setActiveSuggestion] = useState<{ original: string; suggestion: string } | null>(null);

  // Current active deliverable
  const currentDeliverable = deliverables.find((d) => d.type === selectedType);
  const currentContent = currentDeliverable?.currentContent || '';

  const handleGenerate = async () => {
    if (!intent) {
      setGenerationError('Please complete Intent Reconstruction first so Gemma 4 can ground this deliverable.');
      return;
    }

    setIsGenerating(true);
    setGenerationError(null);

    try {
      const result = await generateDeliverableWithGemma(
        selectedType,
        projectTitle,
        intent,
        fragments
      );

      const updatedHistory = currentDeliverable?.history || [];
      const newHistoryItem = {
        id: `rev-${Date.now()}`,
        timestamp: Date.now(),
        content: result.content,
        label: `Generated via Gemma 4 (${new Date().toLocaleTimeString()})`,
      };

      const deliverableToSave: Deliverable = {
        id: currentDeliverable?.id || `deliv-${selectedType}-${Date.now()}`,
        projectId,
        type: selectedType,
        title: result.title,
        currentContent: result.content,
        history: [newHistoryItem, ...updatedHistory],
        updatedAt: Date.now(),
      };

      await onSaveDeliverable(deliverableToSave);
      setIsGenerating(false);
    } catch (err: any) {
      console.error('Deliverable generation error:', err);
      setGenerationError(err.message || 'Gemma 4 generation failed.');
      setIsGenerating(false);
    }
  };

  const handleAssistText = async (instruction: 'continue' | 'expand' | 'clarify' | 'polish' | 'questions') => {
    if (!currentContent) {
      setGenerationError('Generate or write draft text first to use non-destructive assistance.');
      return;
    }

    // Capture selected text or use the last 2 paragraphs
    const selection = window.getSelection()?.toString().trim();
    const targetText = selection && selection.length > 5 ? selection : currentContent;

    setIsAssisting(true);
    setAssistInstruction(instruction);
    setGenerationError(null);

    try {
      const fragmentSnippets = fragments.map((f) => `${f.title}: ${f.extractedText.slice(0, 300)}`);
      const result = await assistTextWithGemma(targetText, instruction, fragmentSnippets);

      setActiveSuggestion({
        original: result.original,
        suggestion: result.suggestion,
      });
      setIsAssisting(false);
    } catch (err: any) {
      setGenerationError(err.message || 'Gemma 4 assistance failed.');
      setIsAssisting(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!activeSuggestion || !currentDeliverable) return;

    let newContent = currentDeliverable.currentContent;
    if (newContent.includes(activeSuggestion.original)) {
      newContent = newContent.replace(activeSuggestion.original, activeSuggestion.suggestion);
    } else {
      newContent = `${newContent}\n\n${activeSuggestion.suggestion}`;
    }

    const newRev = {
      id: `rev-${Date.now()}`,
      timestamp: Date.now(),
      content: newContent,
      label: `Accepted Gemma 4 (${assistInstruction})`,
    };

    await onSaveDeliverable({
      ...currentDeliverable,
      currentContent: newContent,
      history: [newRev, ...currentDeliverable.history],
      updatedAt: Date.now(),
    });

    setActiveSuggestion(null);
  };

  const handleRestoreRevision = async (revContent: string, label: string) => {
    if (!currentDeliverable) return;
    await onSaveDeliverable({
      ...currentDeliverable,
      currentContent: revContent,
      history: [
        {
          id: `rev-${Date.now()}`,
          timestamp: Date.now(),
          content: revContent,
          label: `Restored: ${label}`,
        },
        ...currentDeliverable.history,
      ],
      updatedAt: Date.now(),
    });
  };

  const handleExportMarkdown = () => {
    if (!currentContent) return;
    const blob = new Blob([currentContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${projectTitle.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${selectedType}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyToClipboard = () => {
    if (!currentContent) return;
    navigator.clipboard.writeText(currentContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Project</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800">{projectTitle}</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Output Studio
          </h1>
          <p className="text-xs text-slate-600">
            Synthesize polished deliverables with Gemma 4. Inspect suggestions side-by-side with zero automated overwrites.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleCopyToClipboard}
            disabled={!currentContent}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-40 transition-colors shadow-2xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExportMarkdown}
            disabled={!currentContent}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-40 transition-colors shadow-xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Markdown (.md)</span>
          </button>
        </div>
      </div>

      {/* Deliverable Presets & Generation Trigger */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setSelectedType('project_brief')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedType === 'project_brief'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Executive Project Brief
          </button>
          <button
            onClick={() => setSelectedType('sprint_roadmap')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap ${
              selectedType === 'sprint_roadmap'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sprint Recovery Roadmap
          </button>
        </div>

        <button
          onClick={handleGenerate}
          disabled={isGenerating || !intent}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
          <span>{currentContent ? 'Re-generate with Gemma 4' : 'Synthesize Deliverable'}</span>
        </button>
      </div>

      {/* Error Notice with Retry */}
      {generationError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            <span className="text-xs leading-normal">{generationError}</span>
          </div>
          <button
            onClick={handleGenerate}
            className="px-3 py-1 text-xs font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors shrink-0"
          >
            Retry
          </button>
        </div>
      )}

      {/* Safe Text Assistance Bar */}
      <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-600 font-medium">
          <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
          <span>Non-Destructive Text Assistance:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: 'continue', label: 'Continue Writing' },
            { id: 'expand', label: 'Expand Rationale' },
            { id: 'clarify', label: 'Clarify Logic' },
            { id: 'polish', label: 'Technical Polish' },
            { id: 'questions', label: 'Find Blindspots' },
          ].map((act) => (
            <button
              key={act.id}
              onClick={() => handleAssistText(act.id as any)}
              disabled={isAssisting || !currentContent}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40 transition-colors shadow-2xs"
            >
              {isAssisting && assistInstruction === act.id ? 'Thinking...' : act.label}
            </button>
          ))}
        </div>
      </div>

      {/* Side-by-Side Suggestion Review Drawer (Active when AI proposes changes) */}
      {activeSuggestion && (
        <div className="bg-white border-2 border-indigo-500 rounded-2xl p-5 shadow-lg animate-in slide-in-from-top-4 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600"></span>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Side-by-Side Suggestion Review ({assistInstruction})
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSuggestion(null)}
                className="px-3 py-1 text-xs font-medium text-slate-600 hover:text-slate-900 rounded"
              >
                Dismiss / Reject
              </button>
              <button
                onClick={handleAcceptSuggestion}
                className="flex items-center gap-1.5 px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-xs"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Accept Suggestion</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider block mb-1.5 font-semibold">
                Original Text (Protected)
              </span>
              <div className="text-xs text-slate-700 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {activeSuggestion.original}
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-indigo-50/40 border border-indigo-200">
              <span className="text-[11px] font-mono text-indigo-700 uppercase tracking-wider block mb-1.5 font-semibold">
                Gemma 4 Proposed Continuation
              </span>
              <div className="text-xs text-indigo-950 font-mono whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">
                {activeSuggestion.suggestion}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Deliverable Editor View */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-slate-50/70 border-b border-slate-200 text-xs">
          <div className="flex items-center gap-2 text-slate-600">
            <FileCode className="w-4 h-4 text-slate-500" />
            <span className="font-semibold text-slate-800">
              {selectedType === 'project_brief' ? 'Executive Project Brief' : 'Sprint Recovery Roadmap'}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-slate-500">
              {currentContent.split(/\s+/).filter(Boolean).length} words
            </span>
          </div>

          {/* History Revision Dropdown */}
          {currentDeliverable && currentDeliverable.history.length > 0 && (
            <div className="flex items-center gap-2">
              <History className="w-3.5 h-3.5 text-slate-400" />
              <select
                onChange={(e) => {
                  const rev = currentDeliverable.history.find((h) => h.id === e.target.value);
                  if (rev) handleRestoreRevision(rev.content, rev.label);
                }}
                defaultValue=""
                className="text-xs bg-white border border-slate-200 rounded px-2 py-1 text-slate-700"
              >
                <option value="" disabled>
                  Restore Version History ({currentDeliverable.history.length})
                </option>
                {currentDeliverable.history.map((h, i) => (
                  <option key={h.id} value={h.id}>
                    v{currentDeliverable.history.length - i}: {h.label}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {currentContent ? (
          <textarea
            rows={18}
            value={currentContent}
            onChange={async (e) => {
              if (currentDeliverable) {
                await onSaveDeliverable({
                  ...currentDeliverable,
                  currentContent: e.target.value,
                  updatedAt: Date.now(),
                });
              }
            }}
            placeholder="Draft content will appear here..."
            className="w-full p-6 text-sm font-mono text-slate-800 leading-relaxed border-none focus:outline-hidden resize-y"
          />
        ) : (
          <div className="p-16 text-center">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 font-display mb-1">
              No Deliverable Generated Yet
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
              Click the "Synthesize Deliverable" button above to have Gemma 4 produce a comprehensive, structured {selectedType === 'project_brief' ? 'Project Brief' : 'Sprint Roadmap'} grounded in your project fragments.
            </p>
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !intent}
              className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors shadow-xs"
            >
              Synthesize with Gemma 4
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
