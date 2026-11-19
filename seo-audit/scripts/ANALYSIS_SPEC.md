# Analysis spec — per-engine SEO audit

## Subject
Installing custom Android ROMs as alternatives to stock proprietary Android.

## Hard rules
1. Your ONLY data source is your assigned `data/<provider>.json`. Do not browse the web. Do not use any search tool. Do not read another provider's data or report.
2. Every number must be computed from the file (use `python3`), not eyeballed.
3. If a field is missing (e.g. dates), write "not returned by this endpoint". Never guess.
4. No recommendations that need volume or backlink data.

## Input shape
`data/<provider>.json`:
```
{ provider, captured_at, top_n: 8,
  queries: [ { id, query, intent, http_status, latency_ms,
               results: [ {url, title, published_date, snippet} ], error } ] }
```
10 queries × up to 8 results.

## Required output: `reports/<provider>.md`

### 1. Header
Provider, capture timestamp, rows analysed, queries failed.

### 2. Query → result map
Table: `id | query | intent | what actually came back (1 short phrase) | intent match (Yes / Partial / No)`.
Intent match = did the returned content type serve that query's intent (e.g. an install query answered by install guides, not brand homepages).

### 3. Domain share of voice
Aggregate all rows. Table of domains with count and %; then a table grouping into classes using this rule:
- `vendor_project` — official ROM/OS project (lineageos.org, grapheneos.org, calyxos.org, e.foundation, crdroid.net, pixelexperience.org, divestos.org, iode.tech, postmarketos.org)
- `forum` — reddit.com, xdaforums.com, stackexchange.com, any `forum.*`
- `editorial` — tech news/blog/magazine
- `video` — youtube.com, vimeo.com
- `repo` — github.com, gitlab.com
- `docs` — wiki.*, docs.*, source.android.com
- `aggregator` — ROM catalogues / download lists / device-spec sites
- `commerce` — shops/marketplaces
- `other`

### 4. Diversity
Unique domains; share of rows taken by the top 3 domains; how many queries are dominated by a single domain.

### 5. Freshness
Rows with a date, share ≤18 months old, oldest item. If the endpoint returns no dates, say so and mark freshness "not measurable".

### 6. Long-tail recall checklist
Present / absent, per entity: LineageOS, GrapheneOS, CalyxOS, /e/OS, DivestOS, iodé, postmarketOS, crDroid, Pixel Experience, GSI, Play Integrity, SafetyNet, XDA, Reddit, device codename.

### 7. Query-language evidence
4–8 short verbatim quotes from titles/snippets that reveal how searchers phrase this topic. This is the answer to "what do users actually search".

### 8. What ranks
Top 5 URLs (title + domain) for the 3 most strategically important queries: q4 (install how-to), q6 (best ROM 2026), q9 (banking/Play Integrity).

### 9. Findings
Exactly 5 bullets. Each = one claim + the evidence pointer (query id / count).

### 10. Engine character
2–3 sentences: what this engine appears to optimise for, and the bias/limit a reader must keep in mind.

Keep the whole report tight and factual — no filler. Then return a ≤180-word summary to the coordinator: top domain, strongest and weakest intent coverage, and the single most surprising result.
