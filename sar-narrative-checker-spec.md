# SAR Narrative Quality Checker — v0.1 Build Spec

## Purpose

A tool that takes a draft Suspicious Activity Report (SAR) narrative as input and returns a structured quality critique, modeled on how an experienced SAR QA reviewer would evaluate it. This is a demonstration/portfolio project built to showcase real fraud/AML domain expertise on LinkedIn, not a production compliance tool. It should be simple, fast to build, and easy to demo.

**Not in scope for v0.1:** no real customer/case data, no claim of regulatory compliance certification, no SAR filing/submission functionality, no persistence of sensitive data beyond a single session.

## Core Functionality

1. User pastes a draft SAR narrative into a text input box.
2. The app sends the narrative to an LLM (via API) along with a scoring rubric (see below).
3. The app returns a structured scorecard: pass/flag per category, with a 2-3 sentence rationale for each flag.
4. No file upload required for v0.1 — plain text paste only.
5. No user accounts, no login, no data persistence needed for v0.1 — stateless, single-session tool.

## Scoring Rubric (categories the LLM should evaluate against)

1. **5 W's Coverage** — Does the narrative explicitly cover who, what, when, where, and why? Flag if any are missing or only implied rather than stated.
2. **Typology Language** — Does the narrative name the actual suspicious activity pattern (e.g., structuring, trade-based money laundering, layering, synthetic identity) rather than just describing generic symptoms?
3. **Specificity** — Flag vague filler phrases (e.g., "customer engaged in suspicious activity") vs. concrete detail (dollar amounts, dates, account numbers, transaction counts, frequency).
4. **Internal Consistency** — Do the narrative's stated facts, dates, and figures align with each other, or are there contradictions/timeline gaps?
5. **Length & Density** — Flag narratives that are too thin (likely to be kicked back by examiners as insufficient) or bloated with boilerplate that obscures the actual finding.

The rubric text itself should live in a separate, editable config/prompt file (not hardcoded inline in the app logic), so it can be refined without touching the app's core code.

## Suggested Tech Stack

- Simple web app — a single-page frontend (HTML/CSS/JS or a lightweight framework) is sufficient. No need for a database.
- Backend: a thin API layer that takes the pasted narrative, calls the OpenAI Responses API with the rubric as instructions, and returns structured output.
- Request the LLM return output in a consistent structured format (e.g., JSON with category, pass/flag, rationale) so the frontend can render it as a clean scorecard rather than a wall of text.
- Deployment: keep this simple enough to run locally or deploy to a basic free-tier host — this is a demo, not a production service.

## Output Format (UI)

- A scorecard layout: one row per rubric category, with a clear pass/flag indicator and a short rationale underneath.
- Keep the output visually scannable — this will likely be screen-recorded or screenshotted for a LinkedIn post, so clarity and clean formatting matter.

## Test Data

- The project should include a small set of synthetic/fabricated SAR narratives for testing — some clearly good, some deliberately flawed (missing typology language, vague filler, inconsistent dates) — to confirm the tool correctly flags what it should.
- **Do not use any real casework, real customer data, or real case details from any past professional engagement.** All test narratives must be fabricated from scratch.

## Explicit Non-Goals for v0.1

- No auto-filing or integration with any case management system.
- No claim of regulatory compliance or examiner-approval status — this is a drafting aid only, and the tool/UI should make that clear (e.g., a small disclaimer noting it's not a compliance certification tool).
- No support for every SAR type in v0.1 — scope to generic/structuring-style narratives first; other typologies can be added later if there's interest.
- No file upload (PDF/DOCX) parsing in v0.1 — plain text paste only.

## Open Decisions (to finalize before/during build)

- Whether to build as a fully standalone web app or a lighter single-file artifact.
- Whether the rubric/prompt logic should be fully open in the repo or partially abstracted, since the rubric itself (derived from real SAR QA experience) is the most valuable part of this project.
- Whether to gate access at all post-build, or keep it fully open via a shared link.
