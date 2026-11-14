# User Evidence

Real requests and observed use that justify a data or access decision. The work
lives in `TODO.md`; this file keeps the reason, so a later change can be judged
against what someone actually needed rather than against a hunch.

An entry earns its place when it shows intended use, not curiosity: a specific
question the product failed to answer, asked by someone who would act on the
answer. One person is a signal; two independent people asking the same thing is
a pattern. Record the observation and the link, not just the conclusion, and say
what the evidence does not prove.

## Template

```
### YYYY-MM-DD — short title
- Source: link, and how it surfaced (search, referrer spike, issue, ...)
- Asked for: the question in the asker's terms
- Answered: what the product already covers
- Not answered: the part that stopped short
- Implication: the smallest change that would have answered it
- Limits: who this is, and what it does not establish
- Status: the open item in `TODO.md`
```

## Entries

### 2026-11-12 — Bootloader unlockability

- **Source**: [@Sans_Google on X](https://x.com/Sans_Google/status/2120618505523306874),
  surfaced by a Twitter referrer spike in Umami (`t.co` and
  `com.twitter.android`).
- **Asked for**: a directory of phones whose bootloader can be unlocked,
  from someone who now buys only unlockable devices and recommends them to
  clients.
- **Answered**: the devices themselves — vendor, model and codename search over
  9,104 devices, with the ROMs available per device.
- **Not answered**: whether a given device's bootloader can be unlocked. The
  reply recommending the site says so outright, for both directories it lists.
- **Implication**: an unlock-status field would make the directory the answer to
  the question that prompted the recommendation, instead of a lookup that stops
  one step short. The referral also landed on the root, so nothing on the entry
  page told the visitor whether the site answers this at all.
- **Limits**: one recommendation, one asker, an audience already fluent in
  custom ROMs. It establishes the question, not the demand volume or which
  vendors matter most.
- **Status**: open item in `TODO.md` (record bootloader-unlock status per
  device).

### 2026-11-14 — Bootloader unlockability, second source

- **Source**: [@sysodmins post 30428](https://t.me/sysodmins/30428), surfaced by
  a referrer spike in Umami and located by searching public Telegram channel
  histories for `unrom.com`. The first request to unrom.com arrived 14 seconds
  after the post; the channel had 41,022 subscribers and the post ~3.97K views
  at the time of review.
- **Asked for**: which devices can run custom ROMs, and which can be bought
  without risking a locked bootloader. The post recommends unrom.com as an index
  of more than 9,000 models and 277 ROMs, then links a bootloader-unlock
  repository for buyers.
- **Answered**: device, vendor and codename search over 9,104 devices, with the
  ROMs available per device.
- **Not answered**: whether a given device's bootloader can be unlocked.
- **Implication**: record bootloader-unlock status per device. This is the second
  independent recommendation in three days to point at the same gap.
- **Limits**: one large Russian-language channel, not a measured demand study. It
  establishes that the gap is visible to an audience already choosing hardware
  for custom-ROM support, not how many buyers would use the field or which
  vendors matter most.
- **Status**: open item in `TODO.md` (record bootloader-unlock status per
  device).
