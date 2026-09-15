# unrom

## Rule

**unrom exists for exactly two things: data quality and data accessibility.**

- **Data quality** — accurate, complete, current, correct, deduplicated, with provenance and validation.
- **Data accessibility** — currently: available via the API (complete, stable, fast, exportable) and viewable via the frontend. This is the current state, not a boundary — **any channel that makes the data more available or consumable is in scope** (formats, bulk exports, integrations, discovery).

Roles:

- **Backend** exists to make the data **available through an API**.
- **Frontend** exists to make the data **viewable**.

**Every decision is judged against this rule.** A change earns its place only if it
improves **data quality** or **data accessibility**. Anything that doesn't is out of
scope — no features, polish, or infrastructure for their own sake.

## Product priority

- The **data + API is the product**. The frontend is a neutral access layer whose job is to make the data viewable and usable.
- The **backend data and API must remain fully independent** of the frontend and are the **priority**.
- The **frontend is always second**: it must never become a dependency of the data pipeline, and work on it should not block or reshape the data/API.
