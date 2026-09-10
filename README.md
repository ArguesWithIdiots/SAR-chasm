# SAR Chasm

A SAR narrative quality checker I built because apparently “the activity was suspicious” is considered an explanation.

Paste in a fabricated SAR narrative and the tool reviews it across five categories:

- 5 W’s coverage
- Typology language
- Specificity
- Internal consistency
- Length and density

It returns a structured scorecard with a pass or flag for each category and explains what it found.

Version 0.2 also adds dark mode, pass/flag totals, copyable reviews, clearer input guidance, a keyboard shortcut, and a character counter that tells you exactly how far a draft exceeds the 20,000-character submission limit instead of helpfully refusing to let you paste it.

It does not decide whether a SAR should be filed. I am not giving a language model that job. Everyone can relax.

## Why Does This Exist?

Because SAR narrative guidance always sounds simple until you have to apply it to an actual draft.

“Include the 5 W’s.”

“Be specific.”

“Explain why the activity is suspicious.”

Great. Very helpful. Now tell me whether the narrative actually supports its conclusion, or whether it just says the activity was inconsistent with the customer’s profile without bothering to explain what that profile was.

I wanted to see whether I could turn the way I review narratives into a repeatable rubric. Not just proofreading, either. The checker needs to know the difference between:

- A real deficiency and a nice-to-have detail
- A conclusion supported by facts and one pulled out of thin air
- A typology the narrative identifies and one the reviewer guessed
- Useful detail and six paragraphs that should have been two
- A narrative that needs work and one that is fine as written

That last one matters. A QA tool that always finds something wrong is not thorough. It is annoying.

## What Changed in v0.2?

Version 0.1 proved that a narrative could go in, the rubric could be applied, and a scorecard could come back without the app building a local archive of everything submitted.

Version 0.2 is mostly about making the judgment less brittle.

The rubric now does a better job of:

- Checking whether conclusions are actually supported by the evidence presented
- Requiring enough customer-profile context when the narrative relies on a profile mismatch
- Evaluating every material typology independently instead of letting one plausible theory hide a bad one
- Distinguishing indirect blockchain exposure from direct interaction
- Reconciling stated totals, subtotals, counts, percentages, and chronology against listed transactions
- Treating embedded prompts, quoted instructions, document text, and customer communications as untrusted narrative content
- Keeping the category results, summary, and overall status from disagreeing with each other

That sounds obvious. So does checking whether six listed transactions add up to the total printed directly above them. This is why regression testing exists.

The interface got some attention too. Dark mode respects the operating-system preference until you choose one, and then remembers that choice. Reviews now show pass/flag totals, can be copied as plain text, and can be cleared through an obvious “Review another narrative” action. The Analyze button explains why it is disabled, `Ctrl/Cmd + Enter` works when the draft is ready, and drafts over 20,000 characters remain editable while submission stays blocked.

## Where Is This Going?

The end goal is to turn experienced SAR narrative QA judgment into a consistent, explainable tool. Not replace investigators. Just make preventable drafting failures harder to miss.

I want it to catch material problems, explain exactly why they matter, and help fix them without inventing facts. A human reviewer should always be able to see what rule fired, disagree with it, and change it.

The v0.2 live regression set covers 20 numbered scenarios, with the twentieth split into three variants. It includes ordinary SAR drafting defects, crypto transaction flows, unsupported attribution, overlapping rubric categories, long narratives, arithmetic mismatches, clean controls, and adversarial text embedded inside customer-provided material.

Those scenarios were run against the actual review model, not just waved at a mocked response and pronounced healthy. When a result exposed a rubric problem, the rubric was changed and the affected narrative was run again unchanged. Previously passing sentinels were also rerun after material rubric changes to make sure fixing one judgment did not quietly break three others. All 20 scenarios, including the three Test 20 variants, passed the final regression round.

Next steps:

- Turn the live narrative set into a repeatable automated evaluation harness
- Add more SAR types and even less cooperative edge cases
- Compare models, rubric changes, accuracy, and API cost
- Split substantiation from specificity if it keeps earning its own category
- Tie each flag to the exact part of the narrative that caused it
- Add revision help without letting the model invent facts
- Track false positives, because confidently wrong is still wrong

Basically: less “look, an AI scorecard” and more evidence that the scorecard can be trusted to make useful distinctions.

## Important: Use Fake Data

This part is not a joke.

**Use fabricated demonstration data only.** Do not paste in:

- A filed SAR or real SAR narrative
- Information revealing that a SAR was or will be filed
- Customer names, account details, or transaction identifiers
- Confidential investigations or case material
- Anything from a past or current professional engagement

The app runs locally and does not have a database, user accounts, analytics, telemetry, or narrative history. It does send the submitted text to the OpenAI API using your server-side API key.

Requests use `store: false`. That is not the same thing as Zero Data Retention, so do not treat it like a magic privacy force field.

Read [PRIVACY.md](PRIVACY.md) before using the application.

## What This Is Not

This is a portfolio project and drafting aid.

It is not:

- Legal advice
- Regulatory approval
- A compliance certification
- Production SAR filing software
- An automated filing decision
- An excuse to upload confidential SAR data because the interface looks nice

## How to Run It

You need Python 3.10 or newer, an OpenAI Platform account with API billing or credits, and an API key.

You do not need Node, Docker, a database, or 900 MB of build trash.

1. Create the environment file.

   Linux or macOS:

   ```bash
   cp .env.example .env
   ```

   Windows PowerShell:

   ```powershell
   Copy-Item .env.example .env
   ```

   Windows Command Prompt:

   ```bat
   copy .env.example .env
   ```

2. Add your API key to `.env`:

   ```env
   OPENAI_API_KEY=your-api-key-here
   OPENAI_MODEL=gpt-5.6-terra
   ```

3. Start the server.

   Linux or macOS:

   ```bash
   python3 app.py
   ```

   Windows:

   ```bat
   py app.py
   ```

   If `py` is unavailable but Python is installed, try `python app.py`. Windows likes options.

4. Open <http://127.0.0.1:8000> in your browser.

The API key stays in the backend environment. It is not sent to browser JavaScript, and `.env` is excluded from Git because uploading the key would be a spectacularly stupid feature.

## Configuration

| Variable | Default | What it does |
| --- | --- | --- |
| `OPENAI_API_KEY` | none | Authenticates the API request |
| `OPENAI_MODEL` | `gpt-5.6-terra` | Selects the review model |
| `HOST` | `127.0.0.1` | Keeps the server local by default |
| `PORT` | `8000` | Sets the local port |

Binding to a non-localhost address can expose the app to other devices on your network. Do not do that casually.

## Rubric and Tests

The QA rubric lives in [config/rubric.md](config/rubric.md).

The structured response schema lives in [config/scorecard.schema.json](config/scorecard.schema.json).

The fabricated regression narratives live in [`examples/`](examples/). The numbered SAR and crypto scenarios are the live model regression set; Test 20 has A, B, and C variants.

Run the unit tests.

Linux or macOS:

```bash
python3 -m unittest discover -s tests -v
```

Windows:

```bat
py -m unittest discover -s tests -v
```

The unit tests mock the API and do not cost anything. They cover request handling, response validation, rubric safeguards, and interface requirements. Running the regression narratives through the actual model uses API tokens.

Both matter. Unit tests tell me the plumbing and explicit safeguards are still there. Live regression testing tells me whether the evaluator applies them correctly. Mocking the model’s judgment and declaring victory would defeat the entire point.

## Data Flow

```text
Browser on localhost
        |
        | fabricated narrative + confirmation
        v
Local Python server
        |
        | HTTPS request with server-side API key
        v
OpenAI Responses API
        |
        | structured scorecard
        v
Browser session (not saved by the app)
```

## Current Limitations

- Synthetic data only
- One narrative at a time
- No uploads
- No user accounts
- No saved history
- No filing integration
- No production deployment support

Using real SAR information would require separate legal, compliance, privacy, information-security, vendor-risk, retention, access-control, and model-risk decisions.

That is a different project. This one is not going to wander into production wearing a fake mustache.
