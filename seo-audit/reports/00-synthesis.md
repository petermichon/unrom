# Cross-engine synthesis — custom Android ROMs

**Subject:** installing custom Android ROMs as alternatives to stock proprietary Android
**Engines:** Exa, Parallel, Tavily, TinyFish (Firecrawl excluded by decision — keyless access blocked)
**Method:** one fixed 10-query set × top 8 × en-US, captured 2026-11-06. 320 result rows total.
**Raw data:** `data/<engine>.json` · **Per-engine reports:** `reports/<engine>.md`

---

## 1. The headline

**There is no single "SERP" for this topic.** Cross-engine agreement is low: mean Jaccard on domains per query ranges from **0.07 to 0.43**, and only **3 of 10 queries** return even one domain common to all four engines.

The consensus core is thin — **7 domains appear in all four engines**:

| Domain | Rows | Role |
|---|---:|---|
| wiki.lineageos.org | 18 | official install docs (only when a device is named) |
| github.com | 11 | fix guides, source builds, Play Integrity workarounds |
| androidauthority.com | 9 | editorial explainers |
| privacyportal.co.uk | 5 | commercial content marketing (rooting tools) |
| blog.iode.tech | 5 | vendor blog |
| surfshark.com | 4 | VPN vendor content marketing |
| wired.com | 4 | editorial listicle |

Everything else is engine-specific. That is the single most important finding for SEO: **being "ranked" here is not a stable property — it depends on which index the searcher's tool uses.**

---

## 2. Two different internets

The four engines split into two distinct result universes.

| Profile | Exa | Parallel | Tavily | TinyFish |
|---|---:|---:|---:|---:|
| Unique domains / 80 rows | 54 | 52 | 43 | 40 |
| Top-3 domain share | 21.3% | 30.0% | 32.5% | 43.8% |
| Editorial | 52.5% | 60.0% | 32.5% | 18.8% |
| Forum | 2.5% | 1.2% | 23.8% | **42.5%** |
| Video | 1.2% | 0.0% | 22.5% | 17.5% |
| Official project sites | 7.5% | 12.5% | 10.0% | 7.5% |
| Dates returned | 57.5% | 75.0% | 0% | 0% |
| Dated rows ≤18 months | 65.2% | 33.3% | n/a | n/a |
| Intent match (Yes/Partial/No) | 8/2/0 | 8/2/0 | 7/3/0 | 9/1/0 |

- **Editorial index (Exa, Parallel, and partly Tavily):** catalogues, "best of 2026" listicles, comparison articles. Forums are almost invisible (1–2%).
- **Community index (TinyFish, partly Tavily):** Reddit, XDA, YouTube, Quora. Forums + video are **60%** of TinyFish rows and **46%** of Tavily rows.

Consequence: a page can dominate Exa and Parallel and be completely absent from TinyFish. That is exactly what happens to `thecustomrom.com` (23 rows across 3 engines, **0 rows on TinyFish**).

---

## 3. Query-by-query: who wins, and how much engines agree

| # | Query | Intent | Agreement (mean J) | Who wins | Read |
|---|---|---|---:|---|---|
| q1 | custom android rom | head | 0.26 | Split: catalogue (Exa/Parallel), Android Authority (Tavily), Reddit (TinyFish) | no owner |
| q2 | custom rom vs stock android | position | 0.20 | privacyportal.co.uk (all 4) | commercial content wins |
| q3 | alternative android os | synonym | 0.23 | Wired (all 4), then listicles | editorial owns it |
| q4 | how to install custom rom android | install | **0.07** | **No consensus. Zero official docs in 3/4 engines** | biggest gap |
| q5 | install lineageos on pixel | install+device | **0.43** | **wiki.lineageos.org (all 4)**, 5–8 of 8 slots | official docs win |
| q6 | best custom rom 2026 | decision | 0.15 | thecustomrom.com (Exa/Parallel) vs YouTube/Reddit (Tavily/TinyFish) | format split |
| q7 | grapheneos vs calyxos | compare | 0.18 | shops/blogs + Reddit; no vendor page | thin authority |
| q8 | is installing a custom rom safe | risk | 0.23 | Forums (Tavily/TinyFish) vs generic rooting pages (Exa/Parallel) | misread intent |
| q9 | custom rom banking app play integrity | dealbreaker | 0.12 | YouTube + GitHub + Android Authority; Tavily collapses to 3 unique URLs | lowest-quality SERP |
| q10 | degoogle android | adjacent | 0.18 | YouTube + /e/OS blog + iode; Exa drifts to German | adjacent demand |

**The two structural facts:**

1. **q4 is a vacuum.** For the literal query "how to install custom rom android", only Exa surfaces anything docs-like; Tavily and TinyFish return **zero** official project pages, and Parallel returns mostly "build from source" pages. The generic install query has no authoritative owner.
2. **q5 is the only solved query.** Naming the device flips every engine to the official LineageOS wiki. Specificity, not authority, is what unlocks primary sources.

---

## 4. What users actually search

Derived from result titles and snippets across all four engines (verbatim examples in each per-engine report). The topic is **not** searched as neutral technical vocabulary — it is searched as a decision, a fear, or a rescue.

| Intent | Real phrasing observed | What they want | Who currently answers |
|---|---|---|---|
| Decision anxiety | "still worth it in 2026", "are custom ROMs dying/dead", "if you had to recommend one" | permission + a pick | YouTube, Reddit, catalogue |
| Safety fear | "is it 100% safe", "how dangerous is it", "do you use your email / buy things on it" | risk calibration | forums, Stack Exchange |
| Banking blocker | "will my banking app work", "MEETS_STRONG_INTEGRITY", "Play Integrity fix" | a working workaround | YouTube, GitHub, XDA |
| Device rescue | "reviving older Android devices", "rejuvenate my older phone", "death update" | extend a dying phone | XDA, blogs |
| Beginner install | "for noob", "never that easy", "step by step" | hand-holding | general publishers, wikiHow |
| De-Google (adjacent) | "de-Google without rooting or installing a custom ROM" | privacy without flashing | /e/OS, iode, blogs |
| Build vs install confusion | "build your own custom ROM" | often means *install* | Android Authority, GitHub |

Two phrasing insights worth acting on:
- **"without installing a custom ROM"** is a real, explicit adjacent query — a segment actively looking for the outcome but avoiding the install. ROM content ignores it.
- **Year-stamped decision queries** ("best custom rom 2026", "still worth it in 2026") recur in every engine. Freshness is the entry ticket to this SERP, and two of four engines cannot even verify it.

---

## 5. Where the SEO opportunity is

Ranked by evidence strength, not by speculation:

1. **A device-agnostic, current install guide (q4).** Lowest agreement of any query (J=0.07), no official docs in 3 of 4 engines, and what does rank is generic publisher filler. The single clearest content gap.
2. **A maintained Play Integrity / banking status page (q9).** Highest-anxiety query, worst SERP: Tavily returns 3 unique URLs, two videos duplicated 6 times. No authoritative source exists in any engine.
3. **A "still worth it in 2026" decision page (q6/q8).** The framing appears across all four engines; answers are fragmented between listicles, videos and threads.
4. **Programmatic device-named install pages (q5).** The one query where official docs beat everything, in all four engines. Scalable by device/codename, and the only reliable authority play observed.
5. **The de-Google-without-a-ROM path (q10).** Explicit demand, served only by vendor blogs. A bridge page from privacy intent into ROM content, or a deliberate decision to cede it.

---

## 6. Caveats

- Keyless endpoints, **top 8 only**, single locale, one capture (2026-11-06). This is a snapshot, not rank tracking.
- **Firecrawl excluded** (keyless blocked); its inclusion could add a fifth universe.
- **Tavily and TinyFish returned no publication dates**, so freshness is unmeasurable there — any recency claim about those two engines is unsupported.
- Exa and Parallel drift into non-English results for English queries (3/8 German on q10 for Exa; 8/80 non-English for Parallel).
- Tavily de-duplication is poor: q9's 8 rows are 3 unique URLs.
- `thecustomrom.com` is classified as an aggregator, but its blog competes as editorial — its 23 rows overstate "catalogue" presence and understate "content" presence.
