# Ghostwriter for Reality

**From scattered fragments to finished work.**

Ghostwriter helps people recover unfinished projects by connecting notes, screenshots, documents, and ideas into useful context and actionable outputs.

## Core Features

- **Fragment Vault:** Add typed notes, screenshots, supported documents, and handwritten-note photos.
- **Text Assistance:** Continue, expand, improve, or clarify selected text without automatically replacing the original.
- **Intent Reconstruction:** Use AI to identify the likely goal, decisions, constraints, relationships, contradictions, and missing information across fragments.
- **Evidence Links:** Connect conclusions to the source fragments that support them; label uncertain interpretations as assumptions.
- **Recovery Plan:** Organize work into completed, unfinished, blocked, and unknown items, then suggest prioritized next steps.
- **Output Studio:** Create and edit project briefs, drafts, implementation plans, and other useful deliverables.
- **User Control:** Compare original and generated text, accept or reject suggestions, edit results, regenerate, and restore previous content.
- **Handwriting Support:** Treat handwriting recognition as experimental. Show extracted text beside the original and let users correct it before AI analysis.
- **Local Saving:** Save projects and fragments in browser storage so they remain available between visits on the same browser.
- **Clear Errors:** Handle unsupported files, failed extraction, network errors, and AI failures with understandable messages and retry options.

## Pages and Main Components

1. **Home / Recovery Desk** — recent projects, saved progress, and a clear action to start recovering a project.
2. **Fragment Vault** — add, preview, edit, label, and remove project fragments.
3. **Intent Map** — review the reconstructed goal, related fragments, decisions, contradictions, and uncertain assumptions.
4. **Recovery Plan** — view completed, unfinished, blocked, and unknown work, plus prioritized next steps.
5. **Output Studio** — generate, compare, edit, accept, copy, and export useful deliverables.

Keep navigation consistent and the workflow easy to understand. Do not add unnecessary accounts, social features, admin pages, or unrelated tools to the MVP.

## AI Behavior

Use Gemma 4 for meaningful language tasks:

- Interpret fragments and extract goals, decisions, requirements, and open questions.
- Connect related fragments and propose a likely project intent.
- Identify contradictions and missing context.
- Generate recovery steps and requested outputs using the recovered context.
- Follow explicit user instructions such as continue, expand, improve, or clarify.

Never let AI silently replace the user's original content. If intent is ambiguous, ask a concise clarifying question. Clearly distinguish source-backed facts from AI assumptions. Validate structured AI responses and handle malformed outputs safely.

## Handwriting and Document Processing

Separate extraction from reasoning:

1. Extract text from supported documents and images using suitable parsing/OCR tools.
2. Show extracted text for user verification, especially for handwriting.
3. Preserve uncertain or unreadable sections instead of inventing words.
4. Send corrected text and relevant context to Gemma.

Do not promise perfect handwriting recognition. Make handwriting an experimental capability until tested. Begin with reliable support for typed text, screenshots, and a limited set of document formats.

## Technology Stack

- **Frontend:** React, TypeScript, Tailwind CSS.
- **AI:** Gemma 4 through a verified inference/API option.
- **Server:** Vercel server-side API routes for AI calls and secret protection.
- **Local persistence:** IndexedDB for project data and suitable local files; use browser storage carefully and explain its limits.
- **File extraction:** Appropriate document parsers and OCR/vision tooling, selected according to supported formats.
- **Deployment:** Vercel.
- **Database/auth:** No Supabase or account system required for the initial MVP. Consider cloud sync later only if needed.

Never expose API keys in client-side code. Keep secrets in server-side environment variables. Confirm the chosen Gemma 4 variant, provider terms, input support, and licensing before deployment.

## UI/UX Direction

- **Light mode by default**, with a clean, premium, modern workspace aesthetic.
- Use a subtle grid or technical pattern in the background; avoid plain, empty backgrounds.
- Keep the interface uncluttered, with clear hierarchy, generous spacing, readable typography, restrained borders, and a small accent palette.
- Use **favicons/icons only** for visual decoration. Do not use stock photos, decorative image assets, or copyrighted artwork.
- Use tasteful **3D motion and micro-interactions** sparingly: gentle depth, hover states, smooth transitions, and subtle button feedback. Keep motion performant and respect reduced-motion preferences.
- Buttons should have clear, action-oriented labels such as **Recover Project**, **Add Fragment**, **Continue Text**, **Compare Changes**, **Accept Suggestion**, and **Export**.
- Make layouts responsive and accessible, with keyboard support, visible focus states, adequate contrast, and clear loading/error/success states.
- Use original CSS-generated backgrounds and original UI styling. Use only properly licensed dependencies and icons, and verify all third-party licenses. Do not copy another product's branding or UI assets.

## Functional Requirements

- Users can create and reopen projects locally.
- Users can add and manage supported fragments.
- AI analysis uses the selected project context and explicit user instructions.
- Generated suggestions never overwrite originals automatically.
- Users can review evidence, correct extracted text, and resolve uncertainties.
- Recovery plans and outputs can be edited and exported.
- Refreshing the page should not erase saved projects, subject to browser storage limits.
- Include empty states, progress indicators, cancellation where feasible, retry controls, and friendly error handling.
- Avoid claiming that local storage is permanent or that hosted AI processing is private/offline.

## MVP Priorities

1. Project creation and local saving.
2. Fragment input and preview.
3. Controlled text continuation and expansion.
4. Gemma-based context reconstruction.
5. Evidence-linked Intent Map and uncertainty handling.
6. Recovery Plan and editable Output Studio.
7. Document extraction and experimental handwriting flow.
8. Responsive polish, accessibility, and deployment checks.

## Privacy, Safety, and Legal Notes

- Tell users when their content is sent to a hosted AI or OCR service.
- Do not upload files without user action or clear consent.
- Minimize data sent to external services and avoid logging private content unnecessarily.
- Provide delete controls for locally stored projects and fragments.
- Use original text and user-provided material; do not intentionally reproduce copyrighted works.
- Use only assets, fonts, icons, and dependencies whose licenses permit the intended use. Check the relevant licenses and service terms rather than assuming every model or package is unrestricted.
- Do not make legal, privacy, or accuracy guarantees that the implementation cannot substantiate.

## Success Criteria

A user can add a few fragments from an unfinished project, verify the extracted text, see an evidence-backed reconstruction of their intent, correct mistaken assumptions, generate a useful next-step plan or deliverable, and save or export the result without losing control of the original material.
