# Design critique: Essential Korean Vocabulary (v1, 2026-11-27)

Method: the `design:design-critique` framework, run on the live site at 1440px and iPhone 13
in light, dark and reduced-motion modes. v2 changes are listed at the end.

## Overall impression

v1 is clean and works, but it reads as a well-made **landing page template** (thin giant
type, lime-on-black pills, floating pill nav, card grid, giant footer wordmark), not as a
learning **app** with a point of view. Returning learners land on a sales pitch, not on their
next lesson. The illustrations (warm hanji paper, ink line, seal red) carry a strong identity
that the UI around them ignores.

## Usability

| Finding | Severity | Recommendation |
|---|---|---|
| Returning learners land on the marketing hero and must scroll to find their day | 🔴 | "Today" home for anyone with progress: continue lesson, due reviews, streak, daily goal |
| No sense of a lesson path: four modes are equal tiles, nothing says what to do next | 🔴 | Lesson path per day (Learn → Recall → Type → Listen) with completion and one "Continue" button |
| Course index is 50 identical cards; status (new / in progress / mastered) invisible | 🟡 | Course map in units of 10 with status, mastery ring, current day highlighted |
| No place to see overall progress | 🟡 | Progress page: learned, mastered, streak, 12-week activity, mastery by box, per-unit progress |
| Mobile has no persistent navigation | 🟡 | Bottom tab bar: Today, Course, Review, Progress |
| Practice gives little feedback over a session (no combo, sound, or summary of what moved) | 🟡 | Card stack, in-a-row counter, optional soft sounds and haptics, richer results |
| Cover reveal only on hover, so invisible on touch | 🟢 | Show covers in course rows always |

## Visual hierarchy

- **First thing seen**: the ultralight English headline. Korean, the subject, is secondary
  everywhere except the particle field.
- **Emphasis**: every section uses the same 200-300 weight display size, so nothing leads.
- **Fix**: make Hangul the hero. Korean in a serif Myeongjo face (Noto Serif KR) at large sizes,
  English UI in Pretendard at confident 500-600 weights, smaller.

## Consistency

| Element | Issue | Recommendation |
|---|---|---|
| Color | Lime + pine UI vs cream + seal red illustrations | Hanji paper (#F6EDE2) matching the art, ink, one seal-red accent |
| Type | One family, one weight story for everything | Serif Hangul display + Pretendard UI, tabular numbers for stats |
| Nav | Floating pills feel like a template | Quiet top bar with hairline, streak and due count; bottom tabs on mobile |
| Footer | Giant wordmark is a common template trope | Compact colophon |

## Accessibility

- Contrast passes AA in v1. v2 tokens are re-checked (ratios in docs/PROJECT.md).
- Ultralight 200 weights at mid sizes read thin on low-DPI screens. v2 uses 300 minimum.
- "Move your cursor through the word" hint is meaningless on touch. Hide it there.

## What works

- The particle Hangul hero is distinctive and on-topic. Keep it, with serif glyphs.
- The curtain transition, card flip and answer feedback feel good. Keep them.
- Illustrations are consistent and high quality. Let them set the palette.

## v2 priorities (implemented)

1. App structure: Today, Course, Review and Progress, with top bar and mobile tab bar.
2. Identity: hanji + ink + seal red, Noto Serif KR for Hangul.
3. Lesson path on each day with a single Continue action, per-word mastery.
4. Practice polish: card stack, streak counter, sounds and haptics (toggle), summary with next step.
