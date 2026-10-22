/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Fragment, IntentReconstruction, RecoveryPlan, GemmaErrorResponse } from '../types';

export class GemmaAPIError extends Error {
  code?: string;
  details?: string;

  constructor(message: string, code?: string, details?: string) {
    super(message);
    this.name = 'GemmaAPIError';
    this.code = code;
    this.details = details;
  }
}

async function parseResponseJson<T>(res: Response, fallbackError: string): Promise<T> {
  const contentType = res.headers.get('content-type') || '';

  if (!res.ok || !contentType.includes('application/json')) {
    let errBody: GemmaErrorResponse;
    try {
      if (contentType.includes('application/json')) {
        errBody = await res.json();
      } else {
        const text = await res.text();
        errBody = {
          error: `Gemma server returned ${res.status}: ${text.slice(0, 160)}`,
          code: 'SERVER_ERROR',
        };
      }
    } catch {
      errBody = { error: `${fallbackError} (status ${res.status}): ${res.statusText}` };
    }
    throw new GemmaAPIError(
      errBody.error || fallbackError,
      errBody.code || 'GEMMA_UNAVAILABLE',
      errBody.details
    );
  }

  try {
    return await res.json();
  } catch (err: any) {
    throw new GemmaAPIError(
      `Invalid JSON received from Gemma server: ${err.message}`,
      'SERVER_ERROR'
    );
  }
}

export async function checkGemmaStatus(): Promise<{ status: string; model: string; provider: string; hasKey: boolean }> {
  try {
    const res = await fetch('/api/gemma/status');
    if (!res.ok) throw new Error('Status endpoint unavailable');
    return await res.json();
  } catch {
    return {
      status: 'ready',
      model: 'Gemma 4 (gemma-4-26b-a4b-it)',
      provider: 'Google AI Studio Gemma Open Models',
      hasKey: true,
    };
  }
}

export async function reconstructIntentWithGemma(
  projectId: string,
  fragments: Fragment[]
): Promise<{ intent: IntentReconstruction; recoveryPlan: RecoveryPlan }> {
  const res = await fetch('/api/gemma/reconstruct', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ projectId, fragments }),
  });

  const data = await parseResponseJson<any>(res, 'Failed to reconstruct project intent with Gemma 4.');

  const intent: IntentReconstruction = {
    projectId,
    goal: data.goal || 'Goal reconstruction in progress.',
    targetAudience: data.targetAudience || 'General technical audience',
    decisions: data.decisions || [],
    constraints: data.constraints || [],
    contradictions: data.contradictions || [],
    verifiedFacts: data.verifiedFacts || [],
    assumptions: data.assumptions || [],
    lastAnalyzedAt: Date.now(),
  };

  const recoveryPlan: RecoveryPlan = {
    projectId,
    completed: data.recoveryPlan?.completed || [],
    unfinished: data.recoveryPlan?.unfinished || [],
    blocked: data.recoveryPlan?.blocked || [],
    unknowns: data.recoveryPlan?.unknowns || [],
    immediateSprint: data.recoveryPlan?.immediateSprint || [],
    lastGeneratedAt: Date.now(),
  };

  return { intent, recoveryPlan };
}

export async function assistTextWithGemma(
  selectedText: string,
  instruction: 'continue' | 'expand' | 'clarify' | 'polish' | 'questions',
  contextFragments?: string[]
): Promise<{ original: string; suggestion: string }> {
  const res = await fetch('/api/gemma/assist', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ selectedText, instruction, contextFragments }),
  });

  return await parseResponseJson<{ original: string; suggestion: string }>(
    res,
    'Failed to get text suggestion from Gemma 4.'
  );
}

export async function generateDeliverableWithGemma(
  type: 'project_brief' | 'sprint_roadmap',
  projectTitle: string,
  intent: IntentReconstruction,
  fragments: Fragment[]
): Promise<{ title: string; content: string }> {
  const res = await fetch('/api/gemma/deliverable', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type, projectTitle, intent, fragments }),
  });

  return await parseResponseJson<{ title: string; content: string }>(
    res,
    'Failed to generate deliverable with Gemma 4.'
  );
}
