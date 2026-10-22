/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type FragmentType = 'note' | 'screenshot' | 'handwriting' | 'document';

export interface Fragment {
  id: string;
  projectId: string;
  title: string;
  type: FragmentType;
  rawContent?: string;
  mediaUrl?: string; // base64 or object URL for images
  extractedText: string;
  isVerified: boolean;
  confidence?: number; // 0 - 100
  isHandwritingExperimental?: boolean;
  notes?: string;
  createdAt: number;
  updatedAt: number;
}

export interface DecisionItem {
  id: string;
  title: string;
  rationale: string;
  fragmentIds: string[];
}

export interface ContradictionItem {
  id: string;
  issue: string;
  fragmentIds: string[];
  suggestedResolution?: string;
}

export interface VerifiedFact {
  id: string;
  fact: string;
  fragmentId: string;
}

export interface AIAssumption {
  id: string;
  assumption: string;
  confidence: 'high' | 'medium' | 'low';
  requiresConfirmation: boolean;
  userConfirmed?: boolean;
}

export interface IntentReconstruction {
  projectId: string;
  goal: string;
  targetAudience: string;
  decisions: DecisionItem[];
  constraints: string[];
  contradictions: ContradictionItem[];
  verifiedFacts: VerifiedFact[];
  assumptions: AIAssumption[];
  lastAnalyzedAt: number;
}

export interface RecoveryTask {
  id: string;
  step: number;
  task: string;
  priority: 'critical' | 'high' | 'medium';
  rationale: string;
  completed?: boolean;
}

export interface RecoveryPlan {
  projectId: string;
  completed: string[];
  unfinished: string[];
  blocked: string[];
  unknowns: string[];
  immediateSprint: RecoveryTask[];
  lastGeneratedAt: number;
}

export interface HistoryRevision {
  id: string;
  timestamp: number;
  content: string;
  label: string;
}

export interface Deliverable {
  id: string;
  projectId: string;
  type: 'project_brief' | 'sprint_roadmap';
  title: string;
  currentContent: string;
  history: HistoryRevision[];
  updatedAt: number;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  createdAt: number;
  updatedAt: number;
  isDemo?: boolean;
  intent?: IntentReconstruction;
  recoveryPlan?: RecoveryPlan;
}

export type WorkspaceTab = 'desk' | 'vault' | 'intent' | 'recovery' | 'studio';

export interface GemmaErrorResponse {
  error: string;
  code?: 'GEMMA_UNAVAILABLE' | 'INVALID_INPUT' | 'RATE_LIMIT' | 'SERVER_ERROR';
  details?: string;
}
