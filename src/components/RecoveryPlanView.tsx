/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { RecoveryPlan, RecoveryTask } from '../types';
import { 
  Archive, 
  CheckCircle2, 
  Clock, 
  AlertOctagon, 
  HelpCircle, 
  Plus, 
  ChevronRight, 
  ListOrdered,
  ArrowRight,
  Sparkles
} from 'lucide-react';

interface RecoveryPlanViewProps {
  plan: RecoveryPlan | null;
  projectTitle: string;
  onUpdatePlan: (updatedPlan: RecoveryPlan) => void;
  onProceedToOutputStudio: () => void;
}

export const RecoveryPlanView: React.FC<RecoveryPlanViewProps> = ({
  plan,
  projectTitle,
  onUpdatePlan,
  onProceedToOutputStudio,
}) => {
  const [newCompletedItem, setNewCompletedItem] = useState('');
  const [newUnfinishedItem, setNewUnfinishedItem] = useState('');
  const [newBlockedItem, setNewBlockedItem] = useState('');
  const [newUnknownItem, setNewUnknownItem] = useState('');

  if (!plan) {
    return (
      <div className="max-w-7xl mx-auto py-12 text-center">
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-12 bg-white max-w-lg mx-auto">
          <Archive className="w-10 h-10 text-slate-400 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900 mb-1">
            Recovery Plan Not Yet Generated
          </h3>
          <p className="text-xs text-slate-500 mb-5">
            Run Intent Reconstruction on your fragments first to allow Gemma 4 to formulate your 4-quadrant status and prioritized sprint steps.
          </p>
        </div>
      </div>
    );
  }

  const toggleTaskCompletion = (taskId: string) => {
    const updatedTasks = plan.immediateSprint.map((t) =>
      t.id === taskId ? { ...t, completed: !t.completed } : t
    );
    onUpdatePlan({ ...plan, immediateSprint: updatedTasks });
  };

  const addItemToQuadrant = (quadrant: 'completed' | 'unfinished' | 'blocked' | 'unknowns', itemText: string) => {
    if (!itemText.trim()) return;
    const updated = {
      ...plan,
      [quadrant]: [...plan[quadrant], itemText.trim()],
    };
    onUpdatePlan(updated);
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
            Project Recovery Plan
          </h1>
          <p className="text-xs text-slate-600">
            Four-quadrant situational matrix and prioritized recovery roadmap synthesized by Gemma 4.
          </p>
        </div>

        <button
          onClick={onProceedToOutputStudio}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition-colors shadow-xs"
        >
          <span>Open Output Studio</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Immediate Sprint Action Strip */}
      <div className="bg-white border border-indigo-200/80 rounded-xl p-6 shadow-xs relative overflow-hidden">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <ListOrdered className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-display">
                Immediate Unblocking Sprint (Next 48 Hours)
              </h3>
              <p className="text-xs text-slate-500">
                Gemma 4 prioritized sequence to restart halted development
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          {plan.immediateSprint.map((item) => (
            <div
              key={item.id}
              onClick={() => toggleTaskCompletion(item.id)}
              className={`p-3.5 rounded-lg border transition-all flex items-start gap-3 cursor-pointer ${
                item.completed
                  ? 'bg-slate-50 border-slate-200 opacity-60'
                  : 'bg-white border-slate-200 hover:border-indigo-300 shadow-2xs'
              }`}
            >
              <input
                type="checkbox"
                checked={Boolean(item.completed)}
                onChange={() => {}} // handled by parent onClick
                className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500 h-4 w-4 border-slate-300 pointer-events-none"
              />

              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-900">
                    Step {item.step}: {item.task}
                  </span>
                  <span
                    className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded font-semibold ${
                      item.priority === 'critical'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                        : item.priority === 'high'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  <span className="font-medium text-slate-700">Rationale: </span>
                  {item.rationale}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4-Quadrant Status Board */}
      <div>
        <h3 className="text-sm font-bold text-slate-900 font-display mb-3">
          Current State Matrix
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Quadrant 1: Completed Work */}
          <div className="bg-white border border-emerald-200/70 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100 mb-3">
                <div className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Completed & Proven Work
                  </h4>
                </div>
                <span className="text-xs font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  {plan.completed.length} items
                </span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.completed.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-emerald-50/30 p-2 rounded border border-emerald-100/60">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Add proven item..."
                value={newCompletedItem}
                onChange={(e) => setNewCompletedItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItemToQuadrant('completed', newCompletedItem);
                    setNewCompletedItem('');
                  }
                }}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={() => {
                  addItemToQuadrant('completed', newCompletedItem);
                  setNewCompletedItem('');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg hover:bg-emerald-100"
              >
                Add
              </button>
            </div>
          </div>

          {/* Quadrant 2: Unfinished Core */}
          <div className="bg-white border border-indigo-200/70 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-indigo-100 mb-3">
                <div className="flex items-center gap-2 text-indigo-900">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Unfinished Core Features
                  </h4>
                </div>
                <span className="text-xs font-mono text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {plan.unfinished.length} items
                </span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.unfinished.map((item, idx) => (
                  <li key={idx} className="text-xs text-slate-700 flex items-start gap-2 bg-indigo-50/20 p-2 rounded border border-indigo-100/60">
                    <span className="text-indigo-500 font-bold">·</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Add in-progress item..."
                value={newUnfinishedItem}
                onChange={(e) => setNewUnfinishedItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItemToQuadrant('unfinished', newUnfinishedItem);
                    setNewUnfinishedItem('');
                  }
                }}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-indigo-500"
              />
              <button
                onClick={() => {
                  addItemToQuadrant('unfinished', newUnfinishedItem);
                  setNewUnfinishedItem('');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-indigo-900 bg-indigo-50 rounded-lg hover:bg-indigo-100"
              >
                Add
              </button>
            </div>
          </div>

          {/* Quadrant 3: Blocked Items */}
          <div className="bg-white border border-rose-200/70 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-rose-100 mb-3">
                <div className="flex items-center gap-2 text-rose-900">
                  <AlertOctagon className="w-4 h-4 text-rose-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Blocked Items & Impasses
                  </h4>
                </div>
                <span className="text-xs font-mono text-rose-700 bg-rose-50 px-2 py-0.5 rounded">
                  {plan.blocked.length} items
                </span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.blocked.map((item, idx) => (
                  <li key={idx} className="text-xs text-rose-900 flex items-start gap-2 bg-rose-50/40 p-2 rounded border border-rose-100/60">
                    <span className="text-rose-500 font-bold">!</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Add blocker..."
                value={newBlockedItem}
                onChange={(e) => setNewBlockedItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItemToQuadrant('blocked', newBlockedItem);
                    setNewBlockedItem('');
                  }
                }}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-rose-500"
              />
              <button
                onClick={() => {
                  addItemToQuadrant('blocked', newBlockedItem);
                  setNewBlockedItem('');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-rose-900 bg-rose-50 rounded-lg hover:bg-rose-100"
              >
                Add
              </button>
            </div>
          </div>

          {/* Quadrant 4: Unknowns & Blindspots */}
          <div className="bg-white border border-amber-200/70 rounded-xl p-5 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-amber-100 mb-3">
                <div className="flex items-center gap-2 text-amber-900">
                  <HelpCircle className="w-4 h-4 text-amber-600" />
                  <h4 className="text-xs font-bold uppercase tracking-wider">
                    Unknowns & Missing Specifications
                  </h4>
                </div>
                <span className="text-xs font-mono text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                  {plan.unknowns.length} items
                </span>
              </div>

              <ul className="space-y-2 mb-4">
                {plan.unknowns.map((item, idx) => (
                  <li key={idx} className="text-xs text-amber-900 flex items-start gap-2 bg-amber-50/30 p-2 rounded border border-amber-100/60">
                    <span className="text-amber-500 font-bold">?</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-2 pt-2 border-t border-slate-100">
              <input
                type="text"
                placeholder="Add unknown..."
                value={newUnknownItem}
                onChange={(e) => setNewUnknownItem(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    addItemToQuadrant('unknowns', newUnknownItem);
                    setNewUnknownItem('');
                  }
                }}
                className="flex-1 px-2.5 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-amber-500"
              />
              <button
                onClick={() => {
                  addItemToQuadrant('unknowns', newUnknownItem);
                  setNewUnknownItem('');
                }}
                className="px-2.5 py-1.5 text-xs font-semibold text-amber-900 bg-amber-50 rounded-lg hover:bg-amber-100"
              >
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
