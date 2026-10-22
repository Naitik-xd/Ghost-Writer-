/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { IntentReconstruction, Fragment } from '../types';
import { 
  Cpu, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle, 
  ExternalLink, 
  Sparkles, 
  ShieldCheck, 
  Layers, 
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

interface IntentMapProps {
  intent: IntentReconstruction | null;
  fragments: Fragment[];
  projectTitle: string;
  isAnalyzing: boolean;
  analysisError: string | null;
  onReconstruct: () => void;
  onToggleAssumption: (assumptionId: string, confirmed: boolean) => void;
  onProceedToRecoveryPlan: () => void;
}

export const IntentMap: React.FC<IntentMapProps> = ({
  intent,
  fragments,
  projectTitle,
  isAnalyzing,
  analysisError,
  onReconstruct,
  onToggleAssumption,
  onProceedToRecoveryPlan,
}) => {
  const [inspectingFragmentId, setInspectingFragmentId] = useState<string | null>(null);

  const inspectedFragment = fragments.find((f) => f.id === inspectingFragmentId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-500 mb-1">
            <span>Project</span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-slate-800">{projectTitle}</span>
            <span aria-hidden="true">·</span>
            <span>{fragments.length} verified fragments</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-display">
            Intent Map & Evidence Engine
          </h1>
          <p className="text-xs text-slate-600">
            Gemma 4 synthesizes latent intent across fragments, connecting conclusions to source evidence and separating verified facts from assumptions.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={onReconstruct}
            disabled={isAnalyzing || fragments.length === 0}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzing ? 'animate-spin' : ''}`} />
            <span>{intent ? 'Re-analyze with Gemma 4' : 'Reconstruct Intent'}</span>
          </button>

          {intent && (
            <button
              onClick={onProceedToRecoveryPlan}
              className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
            >
              <span>View Recovery Plan</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Transparent Error Banner with Retry (Preserving work, never faking) */}
      {analysisError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 shadow-xs">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <h4 className="text-xs font-bold text-rose-900">
                Gemma 4 Analysis Error
              </h4>
              <p className="text-xs text-rose-700 leading-relaxed">
                {analysisError}
              </p>
              <p className="text-[11px] text-rose-600">
                Your local fragments and notes remain completely safe in IndexedDB.
              </p>
            </div>
            <button
              onClick={onReconstruct}
              className="px-3 py-1.5 text-xs font-semibold text-rose-900 bg-rose-100 hover:bg-rose-200 rounded-lg transition-colors shrink-0"
            >
              Retry Gemma 4
            </button>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isAnalyzing && (
        <div className="bg-white border border-slate-200 rounded-xl p-8 text-center shadow-xs">
          <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-3 animate-spin">
            <RefreshCw className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Gemma 4 is analyzing {fragments.length} project fragments...
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Extracting decisions, mapping evidence citations, detecting contradictions, and isolating assumptions.
          </p>
        </div>
      )}

      {/* Empty State before first analysis */}
      {!intent && !isAnalyzing && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 text-center bg-white">
          <Cpu className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-slate-900 mb-1">
            Intent not yet reconstructed
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto mb-5">
            Click the button below to prompt Gemma 4 to analyze your verified fragments, trace decisions back to citations, and discover contradictions.
          </p>
          <button
            onClick={onReconstruct}
            disabled={fragments.length === 0}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 transition-colors shadow-xs"
          >
            Run Gemma 4 Intent Reconstruction
          </button>
        </div>
      )}

      {/* Populated Intent Map */}
      {intent && !isAnalyzing && (
        <div className="space-y-6">
          {/* Section 1: Reconstructed Goal & Vision */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-indigo-700 font-semibold">
                01 · Core Project Goal & Purpose
              </span>
              <span className="text-xs text-slate-500 font-mono">
                Audience: {intent.targetAudience}
              </span>
            </div>
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug font-display">
              {intent.goal}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Section 2: Key Decisions & Evidence Citations */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                    <span>02 · Reconstructed Architectural Decisions</span>
                  </h3>
                  <span className="text-xs text-slate-500 font-mono">
                    {intent.decisions.length} decisions
                  </span>
                </div>

                <div className="space-y-3">
                  {intent.decisions.map((dec) => (
                    <div
                      key={dec.id}
                      className="p-3.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <h4 className="text-xs font-bold text-slate-900">
                          {dec.title}
                        </h4>
                        <div className="flex items-center gap-1 shrink-0">
                          {dec.fragmentIds.map((fId) => (
                            <button
                              key={fId}
                              onClick={() => setInspectingFragmentId(fId)}
                              className="text-[10px] font-mono bg-indigo-50 hover:bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200/60 transition-colors flex items-center gap-1"
                              title="Click to view source evidence fragment"
                            >
                              <span>Ref: {fId}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {dec.rationale}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Technical Constraints */}
              {intent.constraints.length > 0 && (
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">
                    Governing Technical Constraints:
                  </h4>
                  <ul className="space-y-1.5">
                    {intent.constraints.map((c, i) => (
                      <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                        <span className="text-slate-400 font-mono">·</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Section 3: Contradictions & Open Questions */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 font-display flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>03 · Detected Contradictions & Inconsistencies</span>
                </h3>
                <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {intent.contradictions.length} identified
                </span>
              </div>

              {intent.contradictions.length === 0 ? (
                <div className="p-4 rounded-lg bg-slate-50 border border-slate-100 text-xs text-slate-500 text-center">
                  No direct contradictions found across the submitted fragments.
                </div>
              ) : (
                <div className="space-y-4">
                  {intent.contradictions.map((c) => (
                    <div
                      key={c.id}
                      className="p-4 rounded-lg border border-amber-200 bg-amber-50/50 space-y-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-amber-900">
                          {c.issue}
                        </span>
                        <div className="flex items-center gap-1 shrink-0">
                          {c.fragmentIds.map((fId) => (
                            <button
                              key={fId}
                              onClick={() => setInspectingFragmentId(fId)}
                              className="text-[10px] font-mono bg-white text-amber-900 hover:bg-amber-100 px-1.5 py-0.5 rounded border border-amber-300 transition-colors flex items-center gap-1"
                              title="Inspect conflicting fragment"
                            >
                              <span>{fId}</span>
                              <ExternalLink className="w-2.5 h-2.5" />
                            </button>
                          ))}
                        </div>
                      </div>

                      {c.suggestedResolution && (
                        <div className="text-xs text-amber-800 bg-white/70 p-2.5 rounded border border-amber-200/60 leading-relaxed">
                          <span className="font-semibold">Suggested Resolution: </span>
                          {c.suggestedResolution}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Section 4: Verified Facts vs. AI Assumptions Partition */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs">
            <div className="mb-4">
              <h3 className="text-sm font-bold text-slate-900 font-display">
                04 · Evidence Partition: Verified Facts vs. AI Assumptions
              </h3>
              <p className="text-xs text-slate-500">
                Gemma 4 strictly isolates conclusions backed by original notes from hypotheses that require creator confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Column A: Verified Facts */}
              <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/40">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Source-Backed Facts ({intent.verifiedFacts.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {intent.verifiedFacts.map((fact) => (
                    <div
                      key={fact.id}
                      className="p-2.5 rounded-lg bg-white border border-slate-200/80 text-xs text-slate-700 flex items-start justify-between gap-2 shadow-2xs"
                    >
                      <span className="leading-relaxed">{fact.fact}</span>
                      <button
                        onClick={() => setInspectingFragmentId(fact.fragmentId)}
                        className="text-[10px] font-mono text-slate-500 hover:text-indigo-600 shrink-0 flex items-center gap-0.5"
                      >
                        <span>{fact.fragmentId}</span>
                        <ExternalLink className="w-2.5 h-2.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Column B: AI Assumptions (Interactive user validation) */}
              <div className="border border-indigo-100 rounded-xl p-4 bg-indigo-50/20">
                <div className="flex items-center gap-2 mb-3">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    AI Assumptions ({intent.assumptions.length})
                  </h4>
                </div>

                <div className="space-y-2">
                  {intent.assumptions.map((assump) => (
                    <div
                      key={assump.id}
                      className="p-2.5 rounded-lg bg-white border border-indigo-100/90 text-xs text-slate-700 space-y-2 shadow-2xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="leading-relaxed">{assump.assumption}</span>
                        <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded capitalize shrink-0">
                          {assump.confidence} conf.
                        </span>
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px]">
                        <span className="text-slate-500">
                          {assump.userConfirmed ? 'Confirmed by you' : 'Needs confirmation'}
                        </span>
                        <button
                          onClick={() => onToggleAssumption(assump.id, !assump.userConfirmed)}
                          className={`px-2 py-0.5 rounded font-medium text-xs transition-colors ${
                            assump.userConfirmed
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {assump.userConfirmed ? '✓ Confirmed as Fact' : 'Confirm as Fact'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Evidence Source Inspection Drawer / Modal */}
      {inspectedFragment && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl max-w-lg w-full p-6 shadow-xl animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Evidence: {inspectedFragment.title}
                </h3>
              </div>
              <button
                onClick={() => setInspectingFragmentId(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-[11px] font-mono text-slate-500 mb-2">
              Fragment ID: {inspectedFragment.id} · Type: {inspectedFragment.type}
            </div>

            {inspectedFragment.mediaUrl && (
              <div className="mb-3 rounded-lg overflow-hidden border border-slate-200 max-h-48">
                <img
                  src={inspectedFragment.mediaUrl}
                  alt={inspectedFragment.title}
                  className="w-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
            )}

            <div className="bg-slate-50 rounded-lg p-3 text-xs font-mono text-slate-800 leading-relaxed max-h-60 overflow-y-auto border border-slate-200">
              {inspectedFragment.extractedText}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button
                onClick={() => setInspectingFragmentId(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              >
                Close Evidence
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
