# Parallel — per-engine SEO audit

**Subject:** custom Android ROMs as alternatives to stock Android
**Provider:** Parallel (AI-native search API; captured through its MCP `web_search` tool, objective = query, one `search_query`, depth 8)
**Captured:** 2026-11-06T14:42:59Z
**Rows analysed:** 80 (10 queries × 8 results) · **Queries failed:** 0 · **Mean latency:** 1,182 ms
**Note on fields:** `snippet` is the joined excerpt list; `published_date` was returned for most rows (60/80). Missing values are marked "not returned by this endpoint".

## 1. Query → result map

| id | query | intent | what actually came back | intent match |
|---|---|---|---|---|
| q1 | custom android rom | head | A–Z ROM catalogue, "what is a custom ROM" explainers, build guides (mixed EN/FR/JA) | Yes |
| q2 | custom rom vs stock android | position_vs_stock | Head-to-head opinion/comparison articles, several 2026-dated | Yes |
| q3 | alternative android os | category_synonym | Listicles of de-Googled Android + Linux mobile OS (Sailfish OS, Ubuntu Touch, KaiOS) | Yes |
| q4 | how to install custom rom android | install_howto | Step-by-step install guides (fastboot/TWRP) plus one build-from-source repo | Yes |
| q5 | install lineageos on pixel | install_device | 7 "Build LineageOS for <Pixel>" source-build pages + 1 actual install page, one domain | Partial |
| q6 | best custom rom 2026 | decision_fresh | 2026-dated "best ROM" listicles, half from one catalogue site | Yes |
| q7 | grapheneos vs calyxos | brand_compare | Comparison/review pages (security vs usability framing) | Yes |
| q8 | is installing a custom rom safe | risk_objection | Security essay, a risks checklist, a 2012 Stack Exchange thread, plus 3 generic how-tos | Partial |
| q9 | custom rom banking app play integrity | dealbreaker_objection | Play Integrity "fixes", root-hiding and banking-app guides | Yes |
| q10 | degoogle android | adjacent_privacy | De-Google how-tos (microG/Aurora), one repo, 3 language variants of one blog | Yes |

Coverage: 8 Yes / 2 Partial / 0 No.

## 2. Domain share of voice

52 unique domains across 80 rows.

| domain | rows | % |
|---|---|---|
| thecustomrom.com | 13 | 16.2% |
| wiki.lineageos.org | 8 | 10.0% |
| github.com | 3 | 3.8% |
| www.makeuseof.com | 3 | 3.8% |
| ivonblog.com | 3 | 3.8% |
| www.androidauthority.com | 2 | 2.5% |
| www.privacyportal.co.uk | 2 | 2.5% |
| blog.iode.tech | 2 | 2.5% |
| 44 further domains, 1 row each | 44 | 55.0% |

| class | rows | % |
|---|---|---|
| editorial | 48 | 60.0% |
| aggregator | 15 | 18.8% |
| vendor_project | 10 | 12.5% |
| repo | 3 | 3.8% |
| commerce | 2 | 2.5% |
| forum | 1 | 1.2% |
| other | 1 | 1.2% |
| video / docs | 0 | 0.0% |

Classification notes: `thecustomrom.com` and `androidinfotech.com` are ROM catalogues with editorial guides (aggregator); `eylenburg.github.io` is a comparison table, not a repo. `wiki.lineageos.org` is counted as vendor_project because the registrable domain is the official project — it also qualifies as docs. `privacyportal.co.uk` is counted as commerce (shop copy, shipping offers). Personal blogs, vendor blogs and `dev.to` are editorial; `factually.co` (AI fact-check synthesis) is other.

## 3. Diversity

- **Unique domains:** 52 in 80 rows (1.54 rows/domain); 44 domains appear exactly once.
- **Top-3 domains:** 24 rows = **30.0%** (thecustomrom 13 + wiki.lineageos 8 + one of three domains tied at 3).
- **Queries dominated by a single domain:** 2 — q5 (8/8, wiki.lineageos.org) and q6 (4/8, thecustomrom.com).
- **Effective duplication:** 76 unique URLs in 80 rows; 4 URLs repeat across queries. Rows collapse further into story clusters: ivonblog is one article in zh/ja/en (3 rows) and mizik.sk / mizik.eu are the same post (2 rows), so distinct-source diversity is below the 52-domain headline.

## 4. Freshness

Freshness is **measurable but weak**; measured against capture date 2026-11-06, cut-off 2025-05-06.

- Rows with a date: **60/80 (75.0%)**; 20 rows undated (all 8 on q5, 3 on q2, 3 on q10, 2 on q3, 2 on q7, 1 on q1, 1 on q4).
- Share ≤18 months old: **20/60 dated = 33.3%**, or **25.0% of all 80 rows**.
- Oldest item: **2011-10-17** (extremetech.com, q8). Newest: 2026-10-30.
- 17 rows are dated 2024 or earlier; the q4 install answer set still carries 2016, 2017 and 2021 guides.

## 5. Long-tail recall checklist

| entity | status | evidence (rows mentioning) |
|---|---|---|
| LineageOS | Present | 28 rows, 8 of 10 queries |
| GrapheneOS | Present | 23 rows, q3/q6/q7/q9/q10 |
| CalyxOS | Present | 14 rows, q3/q6/q7/q10 |
| /e/OS | Present | 6 rows, q3/q6 |
| DivestOS | Present (thin) | 1 row, q7 |
| iodé | Present (thin) | 3 rows, q3 |
| postmarketOS | Present (thin) | 2 rows, q3 |
| crDroid | Present (thin) | 4 rows, q6 |
| Pixel Experience | Present (thin) | 3 rows, q6 |
| GSI | **Absent** | 0 rows |
| Play Integrity | Present | 7 rows, q2/q9 |
| SafetyNet | Present as legacy alias only | 3 rows, all q9, always "formerly SafetyNet" |
| XDA | **Absent** | 0 rows, 0 domains |
| Reddit | In-text only | 2 passing mentions (q1, q10); no reddit.com row |
| device codename | Present (q5 only) | 7 Pixels by codename (sailfish, raven, blueline, sunfish, bluejay, frankel, husky); the q3 "Sailfish" hits are Sailfish OS, not a codename |

## 6. Query-language evidence

1. "is flashing a custom ROM still worth the hassle in 2026?" — thecustomrom.com, q2
2. "Will my banking app still work on a custom ROM?" — privacyportal.co.uk FAQ, q2
3. "is it 100% safe to install Custom Roms" — android.stackexchange.com title, q8
4. "Does the use of custom Android ROMs improve or worsen security?" — kevinboone.me title, q8
5. "150+ Android Custom ROMs A→Z" — androidinfotech.com title, q1
6. "My Device is Failing MEETS_STRONG_INTEGRITY" — droidwin.com heading, q9
7. "Comment installer une ROM Custom sur un smartphone Android ?" — tomsguide.fr, q1
8. "Degoogle your Android phone!" / "Android手機去Google化" — ivonblog.com, q10

Phrasing pattern: searchers arrive either with a decision framing ("still worth it", "which one should I install") or a failure framing ("banking app", "100% safe", "MEETS_STRONG_INTEGRITY"), not with "ROM" as a neutral technical term.

## 7. What ranks — q4, q6, q9

**q4 — install how-to**

| # | title | domain |
|---|---|---|
| 1 | How to Install a Custom ROM – Complete Step-by-Step Guide (2026) | thecustomrom.com |
| 2 | How to Install a Custom ROM on Your Android Device | www.makeuseof.com |
| 3 | How To Install A Custom ROM On Android Using TWRP Recovery | www.getdroidtips.com |
| 4 | How to Install a Custom ROM on Any Android Phone (Example: Lenovo K6 Power With LineageOS) | www.instructables.com |
| 5 | Basic guide to build custom android ROM for smartphones | github.com |

**q6 — best ROM 2026**

| # | title | domain |
|---|---|---|
| 1 | Best Custom ROMs for 2026, by Phone and Use | thecustomrom.com |
| 2 | The 10 Best Custom ROMs to Try in 2026 | thecustomrom.com |
| 3 | Best Android Custom ROMs in 2026: GrapheneOS, LineageOS and More | macmyths.com |
| 4 | Best Custom ROMs in 2026 – Top Picks for Every User | thecustomrom.com |
| 5 | 10 Best Custom ROMs for Android You Can Install | techyorker.com |

**q9 — banking / Play Integrity**

| # | title | domain |
|---|---|---|
| 1 | Fix Play Integrity on Any Custom ROM, 2026 Working Method | thecustomrom.com |
| 2 | Hide Root from Banking Apps – Complete Guide for 2026 | thecustomrom.com |
| 3 | How to Pass Play Integrity on LineageOS ROM: The Honest Answer | www.itechguides.com |
| 4 | Play Integrity on AOSP: Troubleshooting Guide | www.privacyportal.co.uk |
| 5 | How to Fix Banking Apps on Custom ROMs in 2026 | thecustomrom.com |

## 8. Findings

- **One catalogue site owns the commercial-intent queries.** thecustomrom.com takes 13/80 rows (16.2%), 4 of 8 on q6 and 3 of 8 on q9 — three of the q6 top five are its own pages (q6 #1, #2, #4).
- **Primary sources are near-absent.** Only 10/80 rows (12.5%) come from official project domains, and 8 of those are a single LineageOS wiki query; 8 of 10 queries returned no official project page at all (q1, q2, q4, q6, q7, q8, q9, q10).
- **The community layer is missing.** Just 1/80 rows is a forum (android.stackexchange.com, q8); zero reddit.com and zero xdaforums.com rows, and XDA never appears even as text — for a topic whose device-specific truth lives on those boards.
- **Freshness is the weakest signal.** Only 25.0% of all rows are ≤18 months old, the oldest is 2011-10-17 (q8), and the q4 install set still ranks 2016/2017/2021 guides second, third and eighth.
- **Intent fit is broad rather than precise.** 8/10 queries are Yes, but q5 answers "install" with 7 of 8 source-build pages and q8 answers "is it safe" with only 4 of 8 on-topic rows; 8/80 (10.0%) rows are non-English for English queries (q1, q3, q10), adding apparent breadth without adding English answers.

## 9. Engine character

Parallel returns **ranked web pages**, not a synthesised answer: every row is a URL + title + excerpt + publish_date, with no generated summary and no aggregated "sources" panel — the AI layer sits in retrieval/ranking, not in the response. It rewards entity-rich, well-structured editorial and catalogue pages (ROM lists, "best of 2026", step-by-step guides) and is strongly recency-aware on decision queries, but it barely indexes forum threads and only surfaces official project docs when the project name is in the query. A reader must remember this is a clean, English-leaning index of the *publishing* web, so the messy device-specific knowledge that actually decides whether a flash works — XDA threads, subreddits, Telegram — is structurally invisible here.
