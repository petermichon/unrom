# TinyFish — per-engine SEO audit

**Provider:** TinyFish (MCP `search` tool, keyless mode, depth 8)
**Captured:** 2026-11-06T14:42:59Z · **Rows analysed:** 80 (10 queries × up to 8) · **Queries failed:** 0 (all HTTP 200, no `error`)
**Caveat:** 8 of 80 rows returned an empty snippet (q3 ×3, q5 ×3, q6 ×2). Content type below is inferred from URL + title + snippet only, so some classifications are cautious rather than certain.

## 1. Query → result map

| id | query | intent | what actually came back | intent match |
|---|---|---|---|---|
| q1 | custom android rom | head | Reddit thread, LineageOS, Wikipedia list, Evolution X, install video, build guide | Yes |
| q2 | custom rom vs stock android | position_vs_stock | Forum threads, one explainer video, four comparison articles | Yes |
| q3 | alternative android os | category_synonym | GrapheneOS, LineageOS, Wired/It's FOSS "best alternatives" listicles, Q&A | Yes |
| q4 | how to install custom rom android | install_howto | Three YouTube walkthroughs, wikiHow, Instructables, XDA newbie guide, forum | Yes |
| q5 | install lineageos on pixel | install_device | Official LineageOS wiki for `sailfish` and `redfin` at #1–2, then threads/video | Yes |
| q6 | best custom rom 2026 | decision_fresh | "Recommend one ROM?", "I tested 10 ROMs", "Are ROMs dead?", "best phones for ROMs" | Partial |
| q7 | grapheneos vs calyxos | brand_compare | Eight comparison pieces (Reddit, HN, project forum, shop guides, video) | Yes |
| q8 | is installing a custom rom safe | risk_objection | Six forum threads, "NOT for everyone" video, one blog essay | Yes |
| q9 | custom rom banking app play integrity | dealbreaker_objection | Reddit, two fix videos, Android Authority news, GitHub fix guide, XDA guide | Yes |
| q10 | degoogle android | adjacent_privacy | Two "de-Google in one tap" videos, iodé blog, Wikipedia, e.foundation | Yes |

## 2. Domain share of voice

40 unique domains, 80 rows.

| domain | n | % | | domain | n | % |
|---|---|---|---|---|---|---|
| youtube.com | 14 | 17.50 | | forum.level1techs.com | 1 | 1.25 |
| reddit.com | 13 | 16.25 | | surfshark.com | 1 | 1.25 |
| xdaforums.com | 8 | 10.00 | | sourceforge.net | 1 | 1.25 |
| quora.com | 3 | 3.75 | | 9to5google.com | 1 | 1.25 |
| lineageos.org | 2 | 2.50 | | privacygear.nl | 1 | 1.25 |
| en.wikipedia.org | 2 | 2.50 | | cape.co | 1 | 1.25 |
| instructables.com | 2 | 2.50 | | news.ycombinator.com | 1 | 1.25 |
| androidauthority.com | 2 | 2.50 | | threecats.au | 1 | 1.25 |
| wiki.lineageos.org | 2 | 2.50 | | discuss.grapheneos.org | 1 | 1.25 |
| github.com | 2 | 2.50 | | sovereignphone.au | 1 | 1.25 |
| evolution-x.org | 1 | 1.25 | | community.oneplus.com | 1 | 1.25 |
| inquisitiveuniverse.com | 1 | 1.25 | | android.stackexchange.com | 1 | 1.25 |
| privacyportal.co.uk | 1 | 1.25 | | kevinboone.me | 1 | 1.25 |
| prizminstitute.com | 1 | 1.25 | | forum.earlybird.club | 1 | 1.25 |
| community.e.foundation | 1 | 1.25 | | droidrooter.com | 1 | 1.25 |
| grapheneos.org | 1 | 1.25 | | forum.fairphone.com | 1 | 1.25 |
| wired.com | 1 | 1.25 | | blog.iode.tech | 1 | 1.25 |
| itsfoss.com | 1 | 1.25 | | howtogeek.com | 1 | 1.25 |
| softwarerecs.stackexchange.com | 1 | 1.25 | | discuss.privacyguides.net | 1 | 1.25 |
| wikihow.com | 1 | 1.25 | | e.foundation | 1 | 1.25 |

Percentages sum to 100.00.

| class | n | % | domains in class |
|---|---|---|---|
| forum | 34 | 42.50 | reddit, xdaforums, quora, stackexchange ×2, community.e.foundation, level1techs, discuss.grapheneos, HN, privacyguides, oneplus, earlybird, fairphone |
| editorial | 15 | 18.75 | androidauthority ×2, instructables ×2, wired, itsfoss, wikihow, 9to5google, howtogeek, surfshark, droidrooter, prizminstitute, inquisitiveuniverse, kevinboone, cape.co |
| video | 14 | 17.50 | youtube |
| vendor_project | 6 | 7.50 | lineageos ×2, grapheneos, evolution-x, e.foundation, blog.iode.tech |
| commerce | 4 | 5.00 | privacyportal, privacygear, sovereignphone, threecats |
| docs | 2 | 2.50 | wiki.lineageos.org |
| repo | 2 | 2.50 | github |
| other | 2 | 2.50 | en.wikipedia |
| aggregator | 1 | 1.25 | sourceforge |

Judgement calls: `wiki.lineageos.org` counted as `docs` per the wiki.* rule (LineageOS total incl. those = 4 rows); Quora counted as `forum`; how-to publishers (wikiHow, Instructables) and shop-hosted guides counted as `editorial`/`commerce` respectively; `discuss.grapheneos.org` counted as `forum` though it is project-run.

## 3. Diversity

- Unique domains: **40** for 80 rows (2.0 rows/domain).
- Top 3 domains (youtube, reddit, xdaforums) = **35/80 = 43.75%**.
- Queries dominated (≥50%) by one domain: **0**. Highest single-domain share is q4 with YouTube at 3/8 (37.5%); q5 has a three-way tie at 2/8. Ranking is dispersed, not concentrated.

## 4. Freshness

**Not measurable.** The endpoint returned no `published_date` for any of the 80 rows (0/80), so share ≤18 months old and oldest item cannot be computed. Year strings ("2026", "2025", "Android 16") appear only inside titles and snippets — that is publisher text, not a date field, and is not treated as recency evidence here.

## 5. Long-tail recall checklist

| entity | status | note |
|---|---|---|
| LineageOS | Present | 18 rows, q1–q6 + q9; only project with a wiki/install presence |
| GrapheneOS | Present | 13 rows, q2/q3/q6/q7; never in install queries |
| CalyxOS | Present | 8 rows, q7 only |
| /e/OS | Present | 3 rows (q2 forum, q3 Wired, q10 e.foundation) |
| DivestOS | **Absent** | 0 rows |
| iodé | Present | 1 row (q10, blog.iode.tech) |
| postmarketOS | **Absent** | 0 rows |
| crDroid | Present | 1 row, q6 snippet only ("CRDROID VS EVOLUTION X VS ARROW OS") |
| Pixel Experience | **Absent as a product** | q1 Evolution X snippet says "replicate the Google Pixel experience" — descriptive prose, not the ROM |
| GSI | Present | 2 rows (q1, q4) |
| Play Integrity | Present | 6 rows, q9 only |
| SafetyNet | **Absent** | 0 rows |
| XDA | Present | 8 rows — always as an xdaforums.com URL, never named in title text |
| Reddit | Present | 14 rows (13 reddit URLs + 1 spoken mention in a q7 video snippet) |
| device codename | Present | 2 rows, q5 only (`sailfish`, `redfin`) |

## 6. Query-language evidence (verbatim)

- "Custom roms are everywhere. The gold standard lineage os to scammy elixer os." — q1
- "I'm looking to rejuvenate my older Android smartphone" — q1 (XDA)
- "Do the advantages of custom OS outweigh the potential risks" — q2 (/e/OS community)
- "What's a good tutorial for a noob to install Lineage on a Pixel 3?" — q5
- "With the death update over my phone I decided to go the lineageos route" — q5
- "If you had to recommend one custom ROM in 2026, which would it be?" — q6
- "most banking apps fail on LineageOS without workarounds" — q9
- "Want to de-Google your Android phone without rooting it or installing a custom ROM?" — q10

## 7. What ranks — q4, q6, q9

**q4 · how to install custom rom android**

1. Install Custom ROM on Any Android Phone Ft. Gaming ROM | No Root — youtube.com
2. How to Install a Custom ROM on Android: The Ultimate Guide — wikihow.com
3. Installing a new custom Android ROM was never that easy… — reddit.com
4. Install Android 16 Custom ROM on ANY Android Phone — youtube.com
5. How to Install a Custom ROM on Any Android Phone (Example…) — instructables.com

**q6 · best custom rom 2026**

1. If you had to recommend one custom ROM in 2026, which would it be? — reddit.com
2. I Tested 10 Custom ROMs So You Don't Have To! — youtube.com
3. Are custom Android ROMs dead in 2026? — surfshark.com
4. Ranking Custom ROMs in 2026! — youtube.com
5. Best phones for Custom ROMs in 2026? — reddit.com

**q9 · custom rom banking app play integrity**

1. Play Integrity / Banking Apps (with Gapps - No Root) — reddit.com
2. How to Pass Play Integrity on Custom & Ported ROMs & Use Banking Apps — youtube.com
3. No banking apps on your custom ROM? This new initiative could help — androidauthority.com
4. Detailed-Guide-Play-Integrity-FIX-Use-Banking-Apps-on-Rooted-Android — github.com
5. Get Strong Integrity on Android 16 - Fix Banking Apps, Revolut & Google… — xdaforums.com

## 8. Findings

- Community and video sources carry this index: forum (34) + video (14) = 48/80 rows (60%), while all official project domains together supply 6 rows (7.5%) — no vendor appears in the top five domains except lineageos.org (2 rows).
- Official install documentation appears only when the device is named: q4 ("how to install custom rom android") returns zero vendor/docs rows — three YouTube videos, wikiHow, Instructables, XDA, a forum — whereas q5 ("install lineageos on pixel") puts wiki.lineageos.org at #1 and #2.
- The "best ROM 2026" intent is not answered by a ranking: q6 contains 0 vendor_project and 0 docs rows, and 4/8 results reframe it as "recommend one", "best phones", or "are ROMs dead"; the only catalogue is sourceforge.net at #7 — hence Partial.
- Objection queries are answered entirely by third parties: q8 is 6/8 forum threads, and q9 has no Google/Android official page and no ROM-project page — its fixes live on YouTube, Reddit, GitHub and XDA, so the reader is trusting strangers on a security-critical claim.
- Recency cannot be audited on this endpoint: 0/80 rows carry a publication date, and 8 rows returned no snippet at all (q3 ×3, q5 ×3, q6 ×2), so freshness is "not measurable" and a few result types are inferred rather than confirmed.

## 9. Engine character

TinyFish returns a broad, community-weighted web sample rather than a curated or freshness-ranked one: it mixes Reddit, XDA, YouTube and mid-tier blogs freely, gives no dates, and truncates snippets to a sentence or less. Its retrieval follows query wording closely — device-named queries reach official docs, generic ones fall back to forum consensus — which makes it useful for seeing how practitioners talk, and unreliable for judging authority, recency, or completeness. Treat the absence of postmarketOS, DivestOS, SafetyNet and true Pixel Experience as index gaps, not as market evidence.
