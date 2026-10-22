# Ghostwriter for Reality

**From scattered fragments to finished work.**

Ghostwriter for Reality is an evidence-linked workspace that helps developers, researchers, and creators recover stalled or abandoned projects. By synthesizing raw notes, whiteboard screenshots, sketches, and documents, Ghostwriter reconstructs verified project intent, maps decisions to source evidence, uncovers contradictions, and generates actionable recovery sprint roadmaps and deliverables.

---

## Core Capabilities

1. **Fragment Vault & Client-Side OCR**
   - Multi-format ingestion: typed markdown, code snippets, documents, whiteboard photos, and handwritten memos.
   - **100% Local OCR with Tesseract.js**: Images and photos are processed in the browser. Zero image files are uploaded to external servers.
   - **Side-by-Side Verification**: Inspect source imagery against extracted text to correct typos before running AI reasoning.
   - **Experimental Handwriting Support**: Low-confidence characters are preserved as `[unreadable]` rather than hallucinated.

2. **Intent Archaeology & Evidence Mapping (Gemma 4)**
   - Reconstructs latent project goals, target audience, and governing technical constraints.
   - Traces architectural decisions directly to source fragment IDs (e.g., `[Ref: frag-1]`).
   - Flags technical contradictions across disparate documents with suggested resolutions.
   - Strictly partitions findings into **Source-Backed Facts** versus **AI Assumptions** (with creator confirmation controls).

3. **Four-Quadrant Recovery Plan**
   - Real-time status board: `Completed Work`, `Unfinished Core`, `Blocked Items`, and `Unknowns & Blindspots`.
   - Generates an immediate prioritized 3-step sprint to resume progress within 48 hours.

4. **Non-Destructive Output Studio**
   - Synthesizes structured **Executive Project Briefs** and **Sprint Recovery Roadmaps**.
   - Safe text assistance bar (*Continue*, *Expand*, *Clarify*, *Polish*, *Find Blindspots*).
   - Side-by-side suggestion review drawer with *Accept*, *Dismiss*, *Copy*, and *Restore Version* controls. Originals are never automatically overwritten.
   - One-click clean Markdown (`.md`) export and full workspace JSON backup.

5. **Local-First Privacy & Persistence**
   - Projects, fragments, and deliverables are stored locally in browser **IndexedDB** (`ghostwriter_reality_db`).
   - Works immediately without user accounts, logins, or cloud database setup.
   - Privacy transparency: Only verified text fragments explicitly submitted for intent reconstruction are processed by Gemma 4.

---

## Free-Tier Protection & Rate Limiting

To guarantee predictable free-tier availability and prevent credit burning:
- **Global Rate Limit**: Capped at **50 requests per 5-hour rolling window** across all sessions/IPs for Gemma 4 endpoints (`/api/gemma/*`).
- **Quota Monitoring**: The workspace navigation bar features an active quota counter showing available requests and window status.
- **Graceful 429 Handling**: If the limit is reached, the UI clearly displays the estimated reset time in minutes while keeping all local notes, OCR verification, editing, and exports fully functional.

---

## Technology Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons.
- **AI Inference**: Gemma 4 (`gemma-4-26b-a4b-it`) via Google AI Studio / Google GenAI SDK.
- **OCR Engine**: Tesseract.js client-side web worker.
- **Backend / API**: Express 4 mounted with Vite in development; compatible with Vercel serverless functions in production (`/api/index.ts`).
- **Storage**: IndexedDB (client-side) with localStorage fallback and JSON backup/restore.
- **SEO / Indexing**: Configured with `<meta name="robots" content="noindex, nofollow" />`.

---

## Local Development

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure Environment**:
   Copy `.env.example` to `.env` and provide your Google AI Studio API key:
   ```env
   GEMINI_API_KEY="your-api-key-here"
   ```

3. **Start Development Server**:
   ```bash
   npm run dev
   ```
   The application runs on `http://localhost:3000`.

4. **Type Check & Lint**:
   ```bash
   npm run lint
   ```

---

## Vercel Deployment

Ghostwriter is structured for one-click deployment on **Vercel**:

1. **Import Repository**: Connect your Git repository to Vercel.
2. **Build Settings**:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
3. **Environment Variables**:
   In Vercel Project Settings > Environment Variables, add:
   - `GEMINI_API_KEY`: Your Google AI Studio API key (provides access to `gemma-4-26b-a4b-it`).
4. **Deploy**: Vercel automatically deploys the frontend static assets and routes `/api/*` to the serverless function defined in `api/index.ts`.

---

## Legal & Copyright Notice

- **Original Implementation**: 100% original codebase and UI styling.
- **License**: Apache-2.0.
- **Zero Proprietary Imagery**: Visual elements use pure CSS technical patterns and open-source Lucide vector icons.
- **Model Attribution**: Powered by open-weights Gemma models developed by Google.
