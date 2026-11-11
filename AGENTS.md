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

Match verification effort to the change:

- **Trivial** (copy, class, a single line): formatting and lint, plus one
  screenshot when visual.
- **Normal**: add the type check and the relevant test file, not the whole
  suite.
- **Risky** (data pipeline, build, API): run the full suite.

Skip extra viewports and screenshots unless the change is responsive. When
speed matters more than certainty, cut verification to what the change
actually needs.
