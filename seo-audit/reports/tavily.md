# Tavily — per-engine SEO audit

**Subject:** installing custom Android ROMs as alternatives to stock Android.

| | |
|---|---|
| Provider | Tavily (keyless `/search`) |
| Captured | 2026-11-06T14:42:59Z |
| Rows analysed | 80 (10 queries × 8; 73 distinct canonical URLs) |
| Queries failed | 0 (10/10 HTTP 200) |
| Endpoint config | `search_depth=basic`, `chunks_per_source=3`, `max_results=8` |
| Latency | median 1,714 ms; min 1,518 ms; max 3,792 ms (q4) |

Tavily returns a `content` chunk per result; that chunk is the evidence used for content type and query language below. The keyless response returned `published_date: null` on every row.

## 2. Query → result map

| id | query | intent | what actually came back | intent match |
|---|---|---|---|---|
| q1 | custom android rom | head | Build-from-source guide, ROM catalogues, 2 brand homepages | Partial |
| q2 | custom rom vs stock android | position_vs_stock | Head-to-head comparisons + forum threads | Yes |
| q3 | alternative android os | category_synonym | Listicles/comparisons + 3 single-vendor homepages | Partial |
| q4 | how to install custom rom android | install_howto | 7 general how-to guides (1 URL duplicated) | Yes |
| q5 | install lineageos on pixel | install_device | Official LineageOS wiki device pages, videos, XDA thread | Yes |
| q6 | best custom rom 2026 | decision_fresh | 3 YouTube rankings + blog/Reddit/GitHub/XDA lists | Yes |
| q7 | grapheneos vs calyxos | brand_compare | 8 comparison posts/threads, no vendor docs | Yes |
| q8 | is installing a custom rom safe | risk_objection | Forum/community Q&A + one blog + one video | Yes |
| q9 | custom rom banking app play integrity | dealbreaker_objection | 2 fix guides + 1 news item; 6 rows are 2 videos | Partial |
| q10 | degoogle android | adjacent_privacy | De-Google explainers/tutorials + /e/OS pages | Yes |

7 Yes, 3 Partial, 0 No.

## 3. Domain share of voice

| Domain | Rows | % |
|---|---:|---:|
| youtube.com | 18 | 22.5 |
| xdaforums.com | 5 | 6.2 |
| github.com | 3 | 3.8 |
| quora.com | 3 | 3.8 |
| reddit.com | 3 | 3.8 |
| wiki.lineageos.org | 3 | 3.8 |
| androidauthority.com | 2 | 2.5 |
| en.wikipedia.org | 2 | 2.5 |
| instructables.com | 2 | 2.5 |
| evolution-x.org | 2 | 2.5 |
| lineageos.org | 2 | 2.5 |
| discuss.privacyguides.net | 2 | 2.5 |
| kevinboone.me | 2 | 2.5 |
| makeuseof.com | 2 | 2.5 |
| privacyportal.co.uk | 1 | 1.2 |
| inquisitiveuniverse.com | 1 | 1.2 |
| community.e.foundation | 1 | 1.2 |
| itsfoss.com | 1 | 1.2 |
| wired.com | 1 | 1.2 |
| privacytools.io | 1 | 1.2 |
| grapheneos.org | 1 | 1.2 |
| calyxos.org | 1 | 1.2 |
| thetechedvocate.org | 1 | 1.2 |
| geeksforgeeks.org | 1 | 1.2 |
| pcguide.com | 1 | 1.2 |
| droidthunder.com | 1 | 1.2 |
| surfshark.com | 1 | 1.2 |
| cape.co | 1 | 1.2 |
| privacydevices.net | 1 | 1.2 |
| sovereignphone.au | 1 | 1.2 |
| privacygear.nl | 1 | 1.2 |
| live-laugh-love.world | 1 | 1.2 |
| news.ycombinator.com | 1 | 1.2 |
| discuss.grapheneos.org | 1 | 1.2 |
| threecats.au | 1 | 1.2 |
| android.stackexchange.com | 1 | 1.2 |
| forum.earlybird.club | 1 | 1.2 |
| community.oneplus.com | 1 | 1.2 |
| thecustomrom.com | 1 | 1.2 |
| howtogeek.com | 1 | 1.2 |
| blog.iode.tech | 1 | 1.2 |
| e.foundation | 1 | 1.2 |
| theprivacydad.com | 1 | 1.2 |

43 domains; 80 rows.

| Class | Rows | % | Members |
|---|---:|---:|---|
| editorial | 26 | 32.5 | androidauthority, instructables, kevinboone.me, makeuseof (2 each) + 18 one-row blogs/guides |
| forum | 19 | 23.8 | xdaforums 5, quora 3, reddit 3, discuss.privacyguides 2, stackexchange, community.e.foundation, community.oneplus, discuss.grapheneos, forum.earlybird, news.ycombinator |
| video | 18 | 22.5 | youtube.com |
| vendor_project | 8 | 10.0 | lineageos.org 2, evolution-x.org 2, grapheneos, calyxos, e.foundation, blog.iode.tech |
| docs | 5 | 6.2 | wiki.lineageos.org 3, en.wikipedia.org 2 |
| repo | 3 | 3.8 | github.com |
| aggregator | 1 | 1.2 | privacytools.io |
| commerce | 0 | 0.0 | — |
| other | 0 | 0.0 | — |

Classification notes: `wiki.lineageos.org` is counted as docs per the `wiki.*` rule even though it is the official project wiki; `evolution-x.org` and `blog.iode.tech` are counted as vendor_project as official project sites. Quora, Hacker News and vendor community subdomains are counted as forum.

## 4. Diversity

- **43 unique domains** across 80 rows.
- **Top 3 domains:** 26 rows, **32.5%** (youtube 18 + xdaforums 5 + one of four domains tied at 3). Counting all ties, the top 5 domains hold 32 rows (40.0%).
- **Single-domain domination:** 1 of 10 queries — q9, where youtube.com takes 6/8 rows (75%). q5 is split three ways (youtube 3, wiki.lineageos 3).
- **Effective duplication:** 73 distinct canonical URLs across 80 rows. 5 rows are within-query repeats: 1 in q4 (`makeuseof` served over http and https) and 4 in q9 (one video 4×, a second 2×, differing only in tracking parameters).

## 5. Freshness

**Not measurable.** `published_date` was **not returned by this endpoint** for any row: **0/80** rows carry a date, so the share ≤18 months old and the oldest item cannot be computed. Some `content` chunks contain human-readable dates (e.g. q1 "Posted: 2025-04-20", q6 "September 3, 2026"), but those are free text, not a structured field, and are not used here. Freshness-sensitive queries such as q6 (`best custom rom 2026`) therefore cannot be audited for recency on this engine.

## 6. Long-tail recall checklist

Present = appears in title/content-chunk text **or** is the result's domain, across all 80 rows.

| Entity | Status | Evidence |
|---|---|---|
| LineageOS | Present | 22 rows, q1 q2 q3 q5 q6 q10 |
| GrapheneOS | Present | 15 rows, q1 q3 q6 q7 q10 |
| CalyxOS | Present | 12 rows, q1 q3 q7 |
| /e/OS | Present | 3 rows, q2 q10; e.foundation result in q10 |
| DivestOS | **Absent** | 0 rows |
| iodé | Present | 1 row, q10 (blog.iode.tech) |
| postmarketOS | **Absent** | 0 rows |
| crDroid | Present | 4 rows, q1 q6 |
| Pixel Experience | Present | 3 rows, q1 q6 |
| GSI | Present | 5 rows, q1 q2 q5 q9 |
| Play Integrity | Present | 9 rows, q7 q9 |
| SafetyNet | Present | 3 rows, q9 |
| XDA | Present | 5 results on xdaforums.com; 6 rows mention it |
| Reddit | Present | 3 results on reddit.com; 4 rows mention it |
| device codename | Present | 3 rows, all q5: `redfin`, `sailfish`, `blueline` |

## 7. Query-language evidence

1. "How to build your own custom Android ROM in 2025" — q1 title, androidauthority.com (searchers conflate building and installing).
2. "I am still thinking about switching to custom rom (LineageOS as it could be installed with no microG), but it will leave my bootloader unlocked." — q2, community.e.foundation.
3. "If you want banking, e.g. Google Pay, Google Wallet, you should keep the stock ROM on" — q2, discuss.privacyguides.net.
4. "Have to remember that you wouldn't be able to use security-sensitive apps like banking app with custom ROM." — q1, xdaforums.com.
5. "Google’s Play Integrity API (formerly SafetyNet) blocks many apps on rooted devices." — q9, thecustomrom.com.
6. "Best Lightweight Custom ROMs for Reviving Older Android Devices" — q1 title, xdaforums.com (longevity framing).
7. "Custom ROMs Are NOT for Everyone in 2026" — q8 title, youtube.com.
8. "The Best Custom ROMs of 2026 (And Why They’re All Dying)" — q6 title, youtube.com.

## 8. What ranks

**q4 — how to install custom rom android (top 5 unique of 8 rows)**

| # | Title | Domain |
|---|---|---|
| 1 | How to Install a Custom ROM on Android | thetechedvocate.org |
| 2 | How To Install a Custom ROM on Android? | geeksforgeeks.org |
| 3 | How to Install a Custom ROM on Your Android Device | makeuseof.com |
| 5 | How to Install a Custom Rom for Android Phones | instructables.com |
| 6 | Android Alternatives: How to install a custom ROM | pcguide.com |

(#4 is the same makeuseof URL over http; #7 Quora, #8 droidthunder.) No vendor or project site appears.

**q6 — best custom rom 2026**

| # | Title | Domain |
|---|---|---|
| 1 | The Best Custom ROMs of 2026 (And Why They’re All Dying) | youtube.com |
| 2 | Ranking Custom ROMs in 2026! | youtube.com |
| 3 | I Tested 10 Custom ROMs So You Don't Have To! | youtube.com |
| 4 | Are custom Android ROMs still worth it? [VIDEO] | surfshark.com |
| 5 | If you had to recommend one custom ROM in 2026, which ... | reddit.com |

Tavily has no dated editorial roundup in this set; three of the top five are videos.

**q9 — custom rom banking app play integrity (only 3 unique URLs in 8 rows)**

| # | Title | Domain |
|---|---|---|
| 1 | How to Fix Banking Apps on Custom ROMs in 2026 | thecustomrom.com |
| 2 | No banking apps on your custom ROM? This new initiative could help. | androidauthority.com |
| 3 | How to Pass Play Integrity on Custom & Ported ROMs & Use Banking Apps | youtube.com |
| 7 | 🔥 Play integrity fix rooted devices run banking payment apps | youtube.com |

Rows 4–6 repeat row 3; rows 7–8 are the same video. Half the "results" are one link.

## 9. Findings

- **Video is the largest single domain and owns the decision stage.** youtube.com = 18/80 rows (22.5%), including 3/8 in q6 and 6/8 in q9; no other domain exceeds 5 rows.
- **q9 is not really eight results.** 8 rows reduce to 3 unique URLs: one video appears 4× and another 2× with different `xstg` tracking parameters, so the dealbreaker query carries three unique results, not eight.
- **Install how-to is a vendor-free zone.** q4 returns 0/8 vendor or project URLs; all seven unique results are general publishers or Q&A (thetechedvocate, geeksforgeeks, makeuseof, instructables, pcguide, quora, droidthunder). Official presence appears only for the device-specific q5, via 3 wiki.lineageos.org pages.
- **Risk objections are forum-shaped.** q8 returns 6/8 forum/community rows (stackexchange, earlybird, OnePlus, Quora, XDA, Reddit); forums are 19/80 (23.8%) overall, second only to editorial.
- **Long-tail recall collapses to three brands.** DivestOS 0 rows and postmarketOS 0, iodé 1, /e/OS 3 — against LineageOS 22, GrapheneOS 15, CalyxOS 12 — so the index reads as a LineageOS/GrapheneOS/CalyxOS topic.

## 10. Engine character

Tavily basic behaves like a semantic chunk retriever pointed at high-authority general tech publishers and YouTube: it returns long `content` extracts with strong topical relevance but no dates, no de-duplication and no freshness signal. It rewards broad, well-linked explainer pages — including low-quality ones whose chunks are navigation boilerplate (q4 #1) — over official documentation except on device-specific queries, where the project wiki surfaces cleanly. The bias a reader must keep: absence here (DivestOS, postmarketOS) reflects what this keyless, 8-result, basic-depth endpoint retrieved, not the actual ROM ecosystem, and its missing `published_date` makes any recency claim unverifiable.
