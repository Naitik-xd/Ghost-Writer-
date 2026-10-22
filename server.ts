/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const IS_DEV = process.env.NODE_ENV !== 'production';

app.use(express.json({ limit: '15mb' }));

// Determine Gemma 4 Configuration
const GEMMA_MODEL_ID = process.env.GEMMA_MODEL_ID || 'gemma-4-26b-a4b-it'; // Verified Gemma 4 model in Google AI Studio
const GEMMA_CUSTOM_URL = process.env.GEMMA_API_URL || null;
const GEMMA_API_KEY = process.env.GEMMA_API_KEY || process.env.GEMINI_API_KEY || '';

// Google GenAI client for Gemma open models
let genAIClient: GoogleGenAI | null = null;
if (GEMMA_API_KEY && !GEMMA_CUSTOM_URL) {
  try {
    genAIClient = new GoogleGenAI({
      apiKey: GEMMA_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build-gemma4',
        },
      },
    });
  } catch (err) {
    console.warn('Failed to initialize GoogleGenAI for Gemma:', err);
  }
}

/**
 * Universal Gemma 4 Caller
 * Routes to either custom OpenAI-compatible Gemma endpoint or Google GenAI Gemma 4 model.
 * Never silently substitutes another model family.
 */
async function callGemma(systemPrompt: string, userPrompt: string, responseJson: boolean = false): Promise<string> {
  // If custom URL is provided (e.g. HuggingFace, vLLM, OpenRouter, Groq)
  if (GEMMA_CUSTOM_URL) {
    const res = await fetch(GEMMA_CUSTOM_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${GEMMA_API_KEY}`,
      },
      body: JSON.stringify({
        model: GEMMA_MODEL_ID,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.2,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Gemma 4 endpoint returned status ${res.status}: ${errText}`);
    }

    const json = await res.json();
    return json.choices?.[0]?.message?.content || '';
  }

  // Use Google GenAI SDK for Gemma 4
  if (genAIClient) {
    const combinedPrompt = `${systemPrompt}\n\n${userPrompt}`;
    const response = await genAIClient.models.generateContent({
      model: GEMMA_MODEL_ID,
      contents: combinedPrompt,
      config: responseJson ? { responseMimeType: 'application/json' } : {},
    });

    if (!response.text) {
      throw new Error('Gemma 4 generated an empty response.');
    }
    return response.text;
  }

  throw new Error(
    'Gemma 4 inference provider is not configured. Please ensure GEMINI_API_KEY or GEMMA_API_KEY is present in server secrets.'
  );
}

// -------------------------------------------------------------
// 1. Status & Health Check
// -------------------------------------------------------------
app.get('/api/gemma/status', (_req: Request, res: Response) => {
  res.json({
    status: GEMMA_API_KEY ? 'ready' : 'missing_key',
    model: 'Gemma 4 (' + GEMMA_MODEL_ID + ')',
    provider: GEMMA_CUSTOM_URL ? 'Custom Gemma Endpoint' : 'Google AI Studio Gemma Open Models',
    hasKey: Boolean(GEMMA_API_KEY),
  });
});

// -------------------------------------------------------------
// 2. Intent Reconstruction with Gemma 4
// -------------------------------------------------------------
app.post('/api/gemma/reconstruct', async (req: Request, res: Response) => {
  try {
    const { projectId, fragments } = req.body;

    if (!fragments || !Array.isArray(fragments) || fragments.length === 0) {
      res.status(400).json({
        error: 'At least one verified fragment is required for intent reconstruction.',
        code: 'INVALID_INPUT',
      });
      return;
    }

    const fragmentSummaries = fragments
      .map(
        (f: any, idx: number) =>
          `[Fragment ID: ${f.id}] (Title: "${f.title}", Type: ${f.type}, Verified: ${f.isVerified})\n${f.extractedText}\n---`
      )
      .join('\n');

    const systemPrompt = `You are Gemma 4, an analytical reasoning model specializing in Project Recovery and Archaeology.
Given a collection of raw fragments (notes, sketches, diagrams, logs) from an abandoned project, reconstruct the original intent.

CRITICAL RULES:
1. Always link decisions and conclusions directly to source fragment IDs (e.g., ["${fragments[0]?.id}"]).
2. Explicitly distinguish verified facts from assumptions.
3. Detect genuine contradictions (e.g. conflicting technical requirements or diverging specs across dates).
4. Outline what is completed, what is unfinished, what is blocking progress, and the exact next 3 immediate sprint steps.
5. You MUST return strictly valid JSON matching this schema:
{
  "goal": "1-2 sentence core intent of what the project is building",
  "targetAudience": "who will use this",
  "decisions": [
    { "id": "dec-1", "title": "Decision Name", "rationale": "Why it was chosen", "fragmentIds": ["id"] }
  ],
  "constraints": ["Technical, hardware, or resource constraint 1", "Constraint 2"],
  "contradictions": [
    { "id": "contra-1", "issue": "Specific contradiction between fragments", "fragmentIds": ["id1", "id2"], "suggestedResolution": "How to resolve" }
  ],
  "verifiedFacts": [
    { "id": "fact-1", "fact": "Direct fact supported by notes", "fragmentId": "id" }
  ],
  "assumptions": [
    { "id": "assump-1", "assumption": "Reasonable assumption made by AI where text is ambiguous", "confidence": "high|medium|low", "requiresConfirmation": true }
  ],
  "recoveryPlan": {
    "completed": ["Item already built/tested"],
    "unfinished": ["In-progress items"],
    "blocked": ["Blockers preventing progress"],
    "unknowns": ["Unanswered questions / missing specs"],
    "immediateSprint": [
      { "id": "task-1", "step": 1, "task": "Immediate concrete task", "priority": "critical|high|medium", "rationale": "Why this unblocks work" }
    ]
  }
}`;

    const userPrompt = `Reconstruct the intent for Project "${projectId}" using these verified fragments:\n\n${fragmentSummaries}`;

    const rawOutput = await callGemma(systemPrompt, userPrompt, true);
    
    // Clean potential markdown fencing
    let cleanJson = rawOutput.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json/, '').replace(/```$/, '').trim();
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```/, '').replace(/```$/, '').trim();
    }

    const parsed = JSON.parse(cleanJson);
    res.json(parsed);
  } catch (error: any) {
    console.error('Gemma 4 Reconstruction Error:', error);
    res.status(503).json({
      error: `Gemma 4 model inference failed: ${error.message || 'Unknown network error'}`,
      code: 'GEMMA_UNAVAILABLE',
      details: 'Inference with Gemma 4 could not be completed. Your local fragments are preserved.',
    });
  }
});

// -------------------------------------------------------------
// 3. Controlled Non-Destructive Text Assistance with Gemma 4
// -------------------------------------------------------------
app.post('/api/gemma/assist', async (req: Request, res: Response) => {
  try {
    const { selectedText, instruction, contextFragments } = req.body;

    if (!selectedText) {
      res.status(400).json({ error: 'selectedText is required.', code: 'INVALID_INPUT' });
      return;
    }

    const systemPrompt = `You are Gemma 4, an assistive writer for technical documentation and project recovery.
You follow explicit user instructions:
- continue: natural continuation of the thought from where it stopped.
- expand: add technical reasoning, architecture depth, or concrete examples.
- clarify: simplify ambiguous wording and improve structural flow.
- polish: professional technical tone refinement.
- questions: list 2-3 precise questions this text leaves unanswered.

CRITICAL: Return ONLY the proposed suggestion text. Do not preface with pleasantries or wrap in commentary.`;

    const userPrompt = `Instruction: ${instruction || 'continue'}
Selected Original Text:
"""
${selectedText}
"""

${contextFragments ? `Context from project fragments:\n${contextFragments.slice(0, 3).join('\n---\n')}` : ''}

Propose the revised / continued text:`;

    const suggestion = await callGemma(systemPrompt, userPrompt, false);
    res.json({
      original: selectedText,
      suggestion: suggestion.trim(),
      instruction,
    });
  } catch (error: any) {
    console.error('Gemma 4 Text Assistance Error:', error);
    res.status(503).json({
      error: `Gemma 4 assistance failed: ${error.message || 'Unknown network error'}`,
      code: 'GEMMA_UNAVAILABLE',
      details: 'Gemma 4 text assistance failed. The original text remains unchanged.',
    });
  }
});

// -------------------------------------------------------------
// 4. Deliverable Generation with Gemma 4
// -------------------------------------------------------------
app.post('/api/gemma/deliverable', async (req: Request, res: Response) => {
  try {
    const { type, projectTitle, intent, fragments } = req.body;

    const systemPrompt = `You are Gemma 4, an executive technical writer and systems architect.
Synthesize a comprehensive, ready-to-share deliverable in clean Markdown format for a recovered project.
Do not invent facts not supported by the intent or fragments. If an aspect is an assumption, state it clearly.`;

    let userPrompt = '';
    if (type === 'sprint_roadmap') {
      userPrompt = `Generate a "Sprint Recovery Roadmap & Task Breakdown" for "${projectTitle}".
Include:
1. Executive Summary & Recovery Milestone
2. Phase 1: Immediate Unblocking Sprint (Next 48 Hours)
3. Phase 2: Core Transport & Architecture Stabilization
4. Phase 3: Validation & Field Benchmarks
5. Unresolved Technical Contradictions & Decisions
6. Acceptance Criteria

Context:
${JSON.stringify({ intent, fragmentCount: fragments?.length || 0 }, null, 2)}`;
    } else {
      userPrompt = `Generate a formal "Executive Project Brief & Problem Statement" for "${projectTitle}".
Include:
1. Project Vision & Core Problem Statement
2. Target Users & High-Impact Use Cases
3. Key Architectural Decisions (citing verified evidence)
4. Critical Technical Constraints
5. Immediate 3-Step Recovery Action Plan

Context:
${JSON.stringify({ intent, fragmentCount: fragments?.length || 0 }, null, 2)}`;
    }

    const content = await callGemma(systemPrompt, userPrompt, false);
    res.json({
      type,
      title: type === 'sprint_roadmap' ? `Sprint Recovery Roadmap — ${projectTitle}` : `Project Brief — ${projectTitle}`,
      content: content.trim(),
    });
  } catch (error: any) {
    console.error('Gemma 4 Deliverable Generation Error:', error);
    res.status(503).json({
      error: `Gemma 4 deliverable generation failed: ${error.message || 'Unknown network error'}`,
      code: 'GEMMA_UNAVAILABLE',
      details: 'Could not generate deliverable with Gemma 4. Existing deliverables are preserved.',
    });
  }
});

// -------------------------------------------------------------
// Mount Vite middlewares in dev or serve dist in production
// -------------------------------------------------------------
async function startServer() {
  if (IS_DEV) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Ghostwriter for Reality server running on http://localhost:${PORT}`);
  });
}

startServer();
