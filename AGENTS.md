# unrom

## Rule

**unrom exists for exactly two things: data quality and data accessibility.**

- **Data quality**: accurate, complete, current, correct, deduplicated, with provenance and validation.
- **Data accessibility**: currently available via the API (complete, stable, fast, exportable) and viewable via the frontend. This is the current state, not a boundary. **Any channel that makes the data more available or consumable is in scope** (formats, bulk exports, integrations, discovery).

Roles:

- **Backend** exists to make the data **available through an API**.
- **Frontend** exists to make the data **viewable**.

**Every decision is judged against this rule.** A change earns its place only if it
improves **data quality** or **data accessibility**. Anything that doesn't is out of
scope. No features, polish, or infrastructure for their own sake.

## Neutrality

Describe the software, not the people. A record carries facts a reader can check
— a source URL, a build status, a device count — and never a judgement about a
project's ethics, its maintainers, or their standing in other communities. A
concern earns a place only with technical evidence: a commit, a missing
licence, a build that cannot be reproduced. "Banned", "notorious",
"trustworthy" and their relatives are out, however true someone believes them
to be.

Two consequences, because they are the ones that come up:

- A project that publishes source gets that recorded even if it copies other
  code, and one that does not gets "no public source" as a fact, not as an
  accusation.
- Nothing ranks projects by quality or safety. Counts describe coverage,
  `status` describes whether builds still ship, and both come from the
  projects' own data.

## Product priority

- The **data + API is the product**. The frontend is a neutral access layer whose job is to make the data viewable and usable.
- The **backend data and API must remain fully independent** of the frontend and are the **priority**.
- The **frontend is always second**: it must never become a dependency of the data pipeline, and work on it should not block or reshape the data/API.

## Beta policy

**While in beta, nothing public is a compatibility promise.** Routes, URLs, query
params, UI components, export filenames, and vendor/device ids may be renamed or
removed outright. No aliases, redirects, deprecation windows, or shims. Prefer
the clean shape over the compatible one.

Three things are exceptions, because they were never compatibility:

- **Canonical redirects** (e.g. case normalization) stay: they prevent duplicate
  self-canonical URLs, which is correctness, not legacy support.
- **`contract/` response shapes are frozen.** Changing one is a versioning
  decision, not a cleanup.
- **`data/` is permanent raw provenance.** Never rewrite snapshots to make a
  refactor or removal easier; fix the normalizer instead.

## Verification

Match verification to the change. The full suite is for changes that can alter
the dataset, the API contract or the build — not for polish.

**Trivial** — copy, CSS class or colour, a logo/data map entry, a one- or
two-line edit:

- `npm run format:check` and `npm run lint`.
- One screenshot at the affected viewport if the change is visual.
- Do **not** run `npm run check`, the server tests or the e2e suite.

**Normal** — component behaviour, a new UI state, route logic, an API query or
response whose shape is unchanged, a test change:

- The trivial checks, plus `npm run check` and the affected e2e spec
  (`npx playwright test e2e/<name>.spec.ts`).

**Risky** — ingest, normalize, build, database schema, `contract/` shapes,
deploy:

- `npm run check`, `npm run test` and the full `npx playwright test`.

Screenshots: take one; add a second viewport only when the change specifically
affects both layouts. Reuse an existing script before writing a new one, and
never build a test harness for a one-line change. Do not run the full suite
“to be safe”. If speed matters more than certainty, say so and cut to the
minimum.
