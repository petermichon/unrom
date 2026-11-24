# unrom

## Rule

**The product is access to the data.** unrom collects device–ROM facts and exists
to make them reachable: findable, comparable, usable, exportable. The data is the
substance; each surface that carries it — the web app today, an app, an export or
an integration tomorrow — competes on how far it carries it and how well it
holds up.

Two things make access worth having, and neither is second:

- **Data quality**: accurate, complete, current, correct, deduplicated, with
  provenance and validation. Quality is the moat: a surface that publishes wrong
  facts loses the visitor and the recommendation, however good the surface.
- **Data accessibility**: the reach and usability of access. Available via the
  API (complete, stable, fast, exportable), through the web app, and **any
  channel that makes the data more available or consumable is in scope**
  (formats, bulk exports, integrations, discovery). This is the current state,
  not a boundary.

Roles:

- **Backend** makes the data **available**: ingest, normalize, contract, API.
- **Frontend** makes it **viewable and usable** for a person. It is the primary
  access surface today, not a decoration on the data.

**Every decision is judged against this rule.** A change earns its place only if
it improves **data quality** or the **reach and trustworthiness of access** to it.
Anything that doesn't is out of scope. No features, polish, or infrastructure for
their own sake.

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

- The **product is access to the data**; the data is what makes it worth
  accessing. Neither the database nor the web app is an end in itself.
- **Access surfaces are plural.** The web app is the primary one today, and the
  API and exports are already surfaces of their own. Another surface is added
  whenever it carries the data further.
- **The pipeline stays surface-agnostic.** The data and API must not depend on
  the web app, because the next surface must not be held hostage to this one.
  Independence is portability, not a ranking.
- **Frontend work is product work.** A page or interaction earns its place by
  making the data more reachable, more usable or more trustworthy — not merely by
  existing or by being clean.

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

## Local development

The maintainer runs `npm run dev:host` (web on 5200, API on 5201) and keeps it
themselves. Do not start a second dev server; reuse the one that is running if a
task needs to look at a page, and never stop a process you did not start.

Temporary servers are fine when a task strictly needs one. Start them on a port
that is free, record the PID, and stop that PID — never `pkill -f`, which also
matches other sessions' `dev:host`. The Playwright config starts its own pair on
3100/3101 and builds into `node_modules/.cache/unrom-e2e`, so a test run leaves
`server/dist` (the dataset your dev API is serving) untouched.
