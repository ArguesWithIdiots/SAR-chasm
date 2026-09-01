# Privacy and Data Handling

## Intended use

This repository is a public demonstration intended exclusively for fabricated SAR-style narratives. It is not designed or authorized for real customer, transaction, investigation, or SAR information.

## What the application stores

The application itself has no database and does not write narratives or scorecards to disk. Browser storage is not used. The local server logs basic HTTP request metadata to the terminal but does not log request bodies, narrative text, scorecards, or API keys.

The browser retains the current text and scorecard in memory while the page remains open. Closing or refreshing the page clears that application state.

## What leaves the computer

When the user selects **Analyze narrative**, the local backend sends the following to the OpenAI Responses API over HTTPS:

- The editable QA rubric
- The submitted narrative
- The JSON response schema
- Request configuration, including the selected model and `store: false`

The OpenAI API key is sent to OpenAI for authentication. It is not sent to the browser UI or to infrastructure operated by this project.

OpenAI's API retention, abuse-monitoring, training, residency, and contractual controls are governed by the user's OpenAI account and current OpenAI terms. `store: false` prevents the generated response from being stored for later retrieval through the Responses API; it does not by itself establish Zero Data Retention.

## Safeguards in this demonstration

- Localhost-only default binding
- Server-side environment variable for the API key
- `.env` excluded from Git
- No database, analytics, telemetry, cookies, or third-party frontend assets
- `store: false` on API requests
- Strict Content Security Policy and no-store browser caching headers
- Narrative length limits
- Mandatory synthetic-data confirmation
- Client-side warnings for several obvious sensitive-data patterns
- Generic internal-error messages designed not to expose request content or secrets

Pattern warnings are not a de-identification system and cannot prove that text is safe to submit.

## Production or institutional adoption

Do not use this demonstration with real information merely because it runs locally. Any proposed institutional deployment requires an independent assessment of applicable SAR-confidentiality obligations, privacy laws, contractual restrictions, approved model providers, retention controls, data residency, access control, audit design, incident response, and human oversight.

