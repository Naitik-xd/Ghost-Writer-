# Ghostwriter for Reality — Implementation Plan (Final)

**From scattered fragments to finished work.** Ghostwriter is an evidence-linked workspace that enables makers, engineers, and researchers to recover abandoned projects by synthesizing raw notes, documents, and screenshots into verified intent, an actionable recovery plan, and production-ready deliverables.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> All 4 final adjustments have been locked into this plan:
> 1. **Gemma 4 Model Specification & Provider Verification**: Dedicated to **Gemma 4** (`gemma-4-it` / `gemma-4` architecture) via server-side `/api/gemma/*` proxy with configurable inference provider endpoint (e.g., standard high-performance inference gateway / OpenRouter / Hugging Face). If the endpoint is unconfigured or returns an error, the system displays an explicit error message with Retry controls—**never silently substituting another model**.
> 2. **Client-Side Tesseract.js Locked In**: 100% local private OCR processing directly inside the browser. **Zero images or raw files are ever sent to an external server**. Handwriting is treated as experimental, and ambiguous segments are tagged as `[unreadable]` rather than hallucinated. Users verify and correct extracted text side-by-side with original media.
> 3. **Navigation Alignment (5 Discrete Areas)**: Both the navigation contract and technical architecture explicitly model all 5 core workspace areas:
>    - **01. Recovery Desk**: Project portfolio, health status, and quick-start actions.
>    - **02. Fragment Vault**: Ingestion, OCR extraction, and side-by-side verification.
>    - **03. Intent Map**: Goal reconstruction, decision tracing, and assumptions vs. verified facts.
>    - **04. Recovery Plan**: 4-quadrant status matrix (Completed, Unfinished, Blocked, Unknown) and immediate sprint steps.
>    - **05. Output Studio**: Non-destructive text assistance, deliverable generation, and Markdown export.
> 4. **Local Data Safeguards & Backup**:
>    - IndexedDB storage error traps (quota management, transaction rollback handling).
>    - Large file upload validation ($\le 10\text{MB}$ per asset) with compression checks.
>    - Destructive action guardrails: double-confirmation modal before deleting any project or fragment.
>    - Full workspace data export/backup (`.json`) alongside individual deliverable exports (`.md`).

---

## 1. Overview & Core Concept

- **What It Does**: Ingests disorganized fragments (markdown notes, code snippets, whiteboard photos, screenshots, and handwritten memos). After the user reviews and corrects any extracted text via client-side OCR, Gemma 4 reconstructs the latent intent: identifying verified goals, architectural decisions, technical constraints, unresolved contradictions, and blind spots. Every finding is linked to source evidence fragments, feeding into a prioritized Recovery Plan and editable Output Studio.
- **Target Audience**: Makers, developers, researchers, and technical writers with stalled repositories, half-filled Obsidian vaults, or napkin sketches.
- **Key Value**: Rescues stalled projects by doing the heavy synthesis work—showing exactly where you left off, what was decided, what contradictions remain, and the immediate next steps to unblock progress.

---

## 2. User Experience & Visual Design

### The 5 Core Workspace Areas
1. **Home / Recovery Desk**:
   - Clear overview of locally saved projects with fragment counts, recovery status, and last modified timestamps.
   - Quick actions: "Recover Project" (blank slate) and "Explore Stalled Example Project" (preloaded with the realistic "HyperLocal: Offline-First Peer Sync" case study).
   - Local privacy badge confirming that raw files and fragments remain 100% inside browser IndexedDB.
   - Workspace-level "Backup All Projects (JSON)" and "Import Backup" utilities.
2. **Fragment Vault**:
   - Multi-format ingestion: Typed Markdown, Code Snippet, Document Upload, Screenshot/Image, or Handwritten Note.
   - **Side-by-Side Verification Modal**: Displays the uploaded image on the left and the extracted text on the right. Users can edit extracted text, flag uncertain passages, and confirm before running Gemma 4 analysis.
   - Visual cards showing fragment type, word count, verification badge, and quick edit/delete controls.
3. **Intent Map (Evidence & Uncertainty Engine)**:
   - **Reconstructed Goal & Purpose**: 1–2 sentence synthesis of what the project is trying to achieve.
   - **Key Decisions & Constraints**: Core architectural choices, each with a clickable citation tag linked to the exact source fragment (`[Ref: Fragment #2]`).
   - **Contradictions & Open Questions**: Highlights conflicting statements across fragments (e.g., Note A says "use WebSockets", Note B says "local BLE only").
   - **Evidence vs. Assumptions Partition**: Explicit division between verified facts (backed by fragments) and AI assumptions (requiring user confirmation).
4. **Recovery Plan (Dedicated Area)**:
   - **4-Quadrant Status Board**:
     - `Completed Work` (what was already built or proven)
     - `Unfinished Core` (in-progress features left mid-sentence)
     - `Blocked Items` (dependencies, missing credentials, or architectural hurdles)
     - `Unknowns & Blindspots` (untested assumptions, missing specs)
   - **Next Immediate Sprint**: Prioritized 3-step recommendation from Gemma 4 to resume development today.
5. **Output Studio (Non-Destructive Deliverables)**:
   - **Presets**: *Executive Project Brief & Problem Statement* and *Sprint Recovery Roadmap & Task Breakdown*.
   - **Safe Text Assistance Bar**: Select any block of text to trigger "Continue Writing", "Expand Rationale", "Clarify Technical Logic", or "Identify Missing Detail".
   - **Side-by-Side Review**: Original text is locked on the left; Gemma 4 suggestion appears on the right with diff highlights.
   - **Action Controls**: `Accept Suggestion`, `Reject / Dismiss`, `Copy to Clipboard`, and `Restore Version`.
   - **Primary Export**: One-click Markdown export (`.md`) formatted with clean frontmatter and headers. Secondary JSON export available.

### Visual Styling & Accessibility
- **Theme**: Light mode workspace with a subtle technical grid (`#F8FAFC` base with faint hairline gridlines `rgba(15, 23, 42, 0.04)`).
- **Surfaces**: Pure white cards (`#FFFFFF`) with crisp hairline borders (`border border-slate-200`) and subtle elevation shadows (`shadow-xs` / `shadow-sm`).
- **Typography**: Display headlines in `Plus Jakarta Sans`, body prose in `DM Sans` (15px, line-height 1.6), and IDs/code in `JetBrains Mono` (`font-mono tabular-nums`).
- **Zero-Pill Discipline**: Metadata uses clean unboxed text with middot (`·`) separators rather than generic rounded colored pills.
- **Micro-Interactions**: Smooth 150ms transitions, clear keyboard focus rings (`focus-visible:ring-2 focus-visible:ring-indigo-500`), accessible touch targets ($\ge 40\text{px}$), and respect for `prefers-reduced-motion`.

---

## 3. Key Product Decisions & Trade-Offs

- **Client-Side Tesseract.js OCR**:
  - *Chosen Approach*: Pure in-browser OCR processing. Images stay local; text is extracted on a background web worker.
  - *Why*: Eliminates privacy risks, ensures zero external data leakage for image files, and complies with offline-first design.
- **Gemma 4 Integration & Error Resilience**:
  - *Chosen Approach*: Serverless endpoints `/api/gemma/*` interact with Gemma 4. If the model endpoint is unreachable or times out, the app renders a clear error card with a "Retry" button. Local data is never purged, and non-AI features remain 100% operational.
  - *Why*: Guarantees model fidelity without silent substitution, honoring user trust.
- **Robust IndexedDB Storage & Backup Safeguards**:
  - *Chosen Approach*: Storage wrappers with quota checking, size validation ($\le 10\text{MB}$ warning), double-confirmation modals on deletion, and full JSON export/import.
  - *Why*: Prevents accidental data loss and browser storage quota exceptions.
- **Non-Destructive Revision Tracking**:
  - *Chosen Approach*: Every deliverable and fragment preserves an immutable revision stack. Suggestions from Gemma 4 require explicit user acceptance.
  - *Why*: Protects original creator intent and prevents automated AI overwrites.

---

## 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Ghostwriter Frontend (React 19)                 │
│                                                                        │
│  ┌───────────────────────┐  ┌────────────────────────────────────────┐ │
│  │     Top Header        │  │       Project State Store (Zustand)     │ │
│  │ (Ghostwriter Wordmark │  │  - Active Project, Fragments, Intent    │ │
│  │  · 5 Nav Tabs · CTA)  │  │  - IndexedDB Sync Adapter (Quota Safe)  │ │
│  └───────────┬───────────┘  └───────────────────┬────────────────────┘ │
│              │                                  │                      │
│  ┌───────────▼──────────────────────────────────▼───────────────────┐  │
│  │                    5-Zone View Container                         │  │
│  │  ┌───────────────┐ ┌──────────────┐ ┌─────────────┐              │  │
│  │  │ Recovery Desk │ │Fragment Vault│ │ Intent Map  │              │  │
│  │  │ (Project List)│ │ (Tesseract)  │ │(Evidence/QC)│              │  │
│  │  └───────┬───────┘ └──────┬───────┘ └──────┬──────┘              │  │
│  │          │                │                │                     │  │
│  │          │  ┌─────────────┴──────┐  ┌──────┴──────────────┐      │  │
│  │          │  │    Recovery Plan   │  │    Output Studio    │      │  │
│  │          │  │(4-Quadrant Status) │  │ (Non-Destructive)   │      │  │
│  │          └──┴────────────────────┴──┴─────────────────────┘      │  │
│  └──────────────────────────────┬───────────────────────────────────┘  │
└─────────────────────────────────┼──────────────────────────────────────┘
                                  │ POST /api/gemma/*
                                  ▼
┌────────────────────────────────────────────────────────────────────────┐
│                     Vercel Serverless API Routes                       │
│                   (Mounted in dev via tsx server.ts)                   │
│                                                                        │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ /api/gemma/reconstruct                                           │  │
│  │ - Prompts Gemma 4 with verified fragments                        │  │
│  │ - Returns structured JSON: goals, decisions, evidence refs,      │  │
│  │   contradictions, verified facts vs assumptions, roadmap         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ /api/gemma/assist                                                │  │
│  │ - Instruction-driven text continuation & expansion               │  │
│  │ - Returns suggested text without altering source                 │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ /api/gemma/deliverable                                           │  │
│  │ - Synthesizes full Project Briefs or Sprint Roadmaps             │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Core TypeScript Interfaces
- `Project`: `{ id: string, title: string, category: string, summary?: string, createdAt: number, updatedAt: number, isDemo?: boolean }`
- `Fragment`: `{ id: string, projectId: string, type: 'note' | 'screenshot' | 'handwriting' | 'document', title: string, rawContent?: string, mediaUrl?: string, extractedText: string, isVerified: boolean, isHandwritingExperimental?: boolean, createdAt: number }`
- `IntentReconstruction`: `{ goal: string, targetAudience: string, decisions: Array<{ title: string, rationale: string, fragmentIds: string[] }>, constraints: string[], contradictions: Array<{ issue: string, fragmentIds: string[] }>, verifiedFacts: Array<{ fact: string, fragmentId: string }>, assumptions: Array<{ assumption: string, confidence: 'high' | 'medium' | 'low', requiresConfirmation: boolean }> }`
- `RecoveryPlan`: `{ completed: string[], unfinished: string[], blocked: string[], unknowns: string[], immediateSprint: Array<{ step: number, task: string, priority: 'critical' | 'high' | 'medium', rationale: string }> }`
- `Deliverable`: `{ id: string, projectId: string, type: 'project_brief' | 'sprint_roadmap', title: string, currentContent: string, history: Array<{ timestamp: number, content: string, label: string }> }`
