# Exa — per-engine SEO audit

## 1. Header

| Field | Value |
|---|---|
| Provider | Exa (`web_search_exa`, MCP, depth 8) |
| Captured | 2026-11-06T14:42:32Z |
| Queries | 10 (all HTTP 200) |
| Rows analysed | 80 (10 × 8) |
| Queries failed | 0 |
| Mean latency | 1,289 ms (range 863–1,772 ms) |

All counts below computed from `data/exa.json`.

## 2. Query → result map

| id | query | intent | what actually came back | match |
|---|---|---|---|---|
| q1 | custom android rom | head | ROM catalogues + official project homepages | Yes |
| q2 | custom rom vs stock android | position_vs_stock | stock-vs-ROM comparison articles | Yes |
| q3 | alternative android os | category_synonym | alternative-OS roundups + project sites | Yes |
| q4 | how to install custom rom android | install_howto | step-by-step flashing/bootloader guides | Yes |
| q5 | install lineageos on pixel | install_device | LineageOS wiki pages for 5 Pixel devices | Yes |
| q6 | best custom rom 2026 | decision_fresh | 2026 "best ROM" listicles + one Reddit thread | Yes |
| q7 | grapheneos vs calyxos | brand_compare | head-to-head privacy-ROM comparisons | Yes |
| q8 | is installing a custom rom safe | risk_objection | rooting/modified-OS risk pages + vendor warnings | Partial |
| q9 | custom rom banking app play integrity | dealbreaker_objection | Play Integrity workaround guides + GitHub issue | Yes |
| q10 | degoogle android | adjacent_privacy | de-Google how-tos, 3 of 8 in German | Partial |

8 Yes / 2 Partial / 0 No.

## 3. Domain share of voice

54 unique domains across 80 rows. Domains with ≥2 rows:

| Domain | Rows | % |
|---|---|---|
| thecustomrom.com | 9 | 11.2% |
| wiki.lineageos.org | 5 | 6.2% |
| privacyguides.org | 3 | 3.8% |
| androidauthority.com | 3 | 3.8% |
| github.com | 3 | 3.8% |
| lineageos.org | 2 | 2.5% |
| eylenburg.github.io | 2 | 2.5% |
| howtogeek.com | 2 | 2.5% |
| altphones.com | 2 | 2.5% |
| secure-os.org | 2 | 2.5% |
| vucense.com | 2 | 2.5% |
| support.google.com | 2 | 2.5% |
| mcafee.com | 2 | 2.5% |
| 41 further domains @ 1 row each | 41 | 51.2% |

| Class | Rows | % | Domains |
|---|---|---|---|
| editorial | 42 | 52.5% | 33 |
| aggregator | 13 | 16.2% | 4 |
| docs | 10 | 12.5% | 5 |
| vendor_project | 6 | 7.5% | 5 |
| repo | 4 | 5.0% | 2 |
| other | 2 | 2.5% | 2 |
| forum | 2 | 2.5% | 2 |
| video | 1 | 1.2% | 1 |

Notes: `thecustomrom.com` = ROM catalogue, classed aggregator even where its blog ranks. `wiki.lineageos.org`, `doc.e.foundation`, `wiki.orangefox.tech`, `support.google.com`, `rootpages.lukeshort.cloud` = docs. `evolution-x.org` and `blog.iode.tech` counted as vendor_project (official project properties).

## 4. Diversity

- Unique domains: **54** (54 domains / 80 rows).
- Top-3 share: **21.3%** (17/80 — thecustomrom 9, wiki.lineageos.org 5, plus one of the three 3-row domains: privacyguides.org / androidauthority.com / github.com).
- Queries dominated by a single domain (>50% of slots): **1 of 10 — q5**, where wiki.lineageos.org takes 5/8 (62.5%).
- Five queries return 8 distinct domains each (q3, q4, q7, q9, q10); the distribution is broad with one hard cluster.

## 5. Freshness

- Rows with a published date: **46/80 = 57.5%**.
- Share of dated rows ≤18 months old (cutoff 2025-05-06): **30/46 = 65.2%** (37.5% of all rows).
- Newest: 2026-11-01. **Oldest: 2014-11-13** (`androidtipsandhacks.com`, q4) — 12 years old and still top-8 for the install how-to.
- 16 dated rows fall outside 18 months, including 2015 (q3), 2016 (q8) and 2020 (q8).
- Undated rows are not stale by definition; date absence is concentrated in q1 (1/8 dated), q5 (1/8), q3 (2/8).

## 6. Long-tail recall checklist

| Entity | Status | Rows | Where |
|---|---|---|---|
| LineageOS | Present | 34 | 9 queries |
| GrapheneOS | Present | 21 | 6 queries |
| CalyxOS | Present | 14 | 5 queries |
| /e/OS | Present | 7 | 4 queries |
| DivestOS | **Absent** | 0 | — |
| iodé | Present (weak) | 3 | q3, q10 |
| postmarketOS | Present (weak) | 2 | q1, q3 |
| crDroid | Present | 9 | q1, q6, q8 |
| Pixel Experience | Partial | 1 explicit brand (romdb.tel, q1); 2 further "Pixel experience" phrases are generic | q1 |
| GSI | **Absent** | 0 | — |
| Play Integrity | Present | 11 | q2, q4, q6, q9 |
| SafetyNet | Present (legacy) | 4 | q4, q6, q9 |
| XDA | Present (thin) | 1 | q4 |
| Reddit | Present (thin) | 1 | q6 |
| device codename | Present | 10 | q1, q5, q6, q9 |

## 7. Query-language evidence

1. "Don't replace your phone. Replace its ROM." — thecustomrom.com, q1
2. "Old phone feeling slow, and no more updates?" — thecustomrom.com, q1
3. "How to install a custom ROM tutorial for noob" — XDA Forums, q4
4. "what custom rom is the best" — r/AndroidRoms, q6
5. "can you live with the integrity and banking trade-offs" — privacyportal.co.uk, q2
6. "No banking apps on your custom ROM? This new initiative could help." — Android Authority, q9
7. "GrapheneOS and CalyxOS are both de-Googled Android builds you install on a wiped phone" — theunhacked.com, q7
8. "De-Googeln: So machen Sie Ihr Android-Handy unabhängiger von Google" — t-online.de, q10

## 8. What ranks

**q4 — how to install custom rom android**

| # | Title | Domain |
|---|---|---|
| 1 | How to install a different operating system on an Android Phone - iFixit Repair Guide | ifixit.com |
| 2 | How to install Lineage OS on your Android device - Android Authority | androidauthority.com |
| 3 | How to Install a Custom ROM on Android - Beginner's Guide | unanswered.io |
| 4 | Android — Root Pages documentation | rootpages.lukeshort.cloud |
| 5 | How to install a custom ROM tutorial for noob \| XDA Forums | xdaforums.com |

**q6 — best custom rom 2026**

| # | Title | Domain |
|---|---|---|
| 1 | Best Custom ROMs for 2026: Ultimate Guide \| TheCustomRom | thecustomrom.com |
| 2 | Should you install LineageOS in 2026? I tested it to find out | androidpolice.com |
| 3 | TheCustomRom: Find a Custom ROM for Your Android Phone | thecustomrom.com |
| 4 | LineageOS vs crDroid: Which ROM Is Better in 2026? | fintechshield.co.in |
| 5 | Best 12 Android Custom ROMs 2026 (Rooted Android) | macmyths.com |

**q9 — custom rom banking app play integrity**

| # | Title | Domain |
|---|---|---|
| 1 | No banking apps on your custom ROM? This new initiative could help. - Android Authority | androidauthority.com |
| 2 | Running banking apps and other suspects on Custom ROMs with root · Jack Henschel's Blog | blog.cubieserver.de |
| 3 | Play Integrity - Info and next steps | github.com |
| 4 | Banking Apps and Google Wallet Detect Root: What Works | magiskguide.com |
| 5 | Banking apps on stock LineageOS + microG in 2026 · ArchWorks | archworks.co |

## 9. Findings

- **An aggregator, not a ROM project, owns the head.** thecustomrom.com holds 9/80 rows (11.2%) — 3 in q1 and 3 in q6 — and its own blog post is result #1 for "best custom rom 2026" (q6), i.e. the catalogue ranks its own listicle above every vendor.
- **Device-specific install is the one place vendor docs win, and they win by collapsing the result set.** q5 gives wiki.lineageos.org 5/8 slots (62.5%), the only single-domain-dominated query; all five are near-duplicate per-device pages (sailfish, shiba, bluejay, lynx, redfin), while the generic q4 how-to returns 8 distinct domains.
- **Freshness is bimodal.** 57.5% of rows carry a date (46/80); 65.2% of those are ≤18 months old, yet the same result sets still surface a 2014 flashing guide (#7, q4), a 2015 open-source-OS listicle (q3) and 2016/2020 safety posts (q8).
- **Risk objection (q8) is the weakest intent match: 4/8 results are about rooting or modified Android generically** (support.google.com ×2, mcafee.com ×2) and one is an OEM bootloader-warranty page (developer.sony.com), not ROM-specific safety; by contrast q9 is 8/8 on-topic workaround content dated as late as 2026-07.
- **Community long tail is nearly absent.** XDA appears once (q4) and Reddit once (q6); DivestOS and GSI never appear, SafetyNet appears in only 4 rows, and Pixel Experience surfaces only as a catalogue row (1 explicit mention) — the index's recall skews to SEO-editorial pages, not forums.

## 10. Engine character

Exa behaves like a semantic topical matcher: it reaches obscure blogs, personal sites, docs and catalogues that a keyword engine would miss, and it follows a query's topic far more reliably than its language — 3/8 results for the English "degoogle android" are German pages. The cost is authority and freshness discipline: 52.5% of rows are editorial/SEO content, 42.5% carry no date, one query returns five near-identical wiki pages, and official vendor domains hold only 7.5% of slots. Read rankings here as "what the index considers semantically closest", not as proof of popularity or trust.
