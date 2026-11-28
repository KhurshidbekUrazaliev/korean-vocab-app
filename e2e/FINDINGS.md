# Accessibility findings for the UI owner

All findings from the first audit (221 occurrences across 72 scans) were fixed on 2026-11-27, and the baseline in `known-findings.json` is now empty. The gate therefore fails on any axe violation in the scanned states, in both themes and both viewport sizes.

Fixes: visible text is now the accessible name for the brand link, Review links (count read as "N due"), flashcards and Progress day links; mastery bars are named images; unit meters are progress bars; dimmed landing steps no longer lower text contrast; row numbers and keyboard hints use `--ink-2`; flashcard and listening screens have a level-one heading.

## Two-course screens

On November 28, 2026, the production build of 06d2359 completed 192 scans across Korean and Arabic, light and dark themes, and desktop and mobile. Both dark-theme profiles reported the same contrast failure on the signed-out Arabic landing page. The Day 2 preview displays a pale glyph (#efe7da) on a light tile (#f6ecdf) while its cover is absent. The contrast is 1.05:1 and the large text needs at least 3:1. The reports identify the tile under `ar-landing`. The other states, including both courses’ Match boards, had zero violations. All 192 scans completed without execution errors.

Two interaction failures also reproduce on that build:

- On `/welcome`, choose Arabic in the **Course language** group in the app bar. The site opens `/ar/welcome` and displays its missing-page heading. The learner should be able to continue the sign-in form with Arabic selected.
- On either Match board, note the positions of the words, then correctly pair one word and its meaning. Both columns reshuffle before the learner chooses a second pair. Card positions should remain stable for the five pairs in a board. Three consecutive correct matches reproduced the reshuffle in Chromium on `/ar/day/1/practice/match`.

The component tests exercise both interactions through the controls. The longer Match test completes both boards, checks the stored score and retries exactly the two confused words.
