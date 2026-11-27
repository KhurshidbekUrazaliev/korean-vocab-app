# Accessibility findings for the UI owner

All findings from the first audit (221 occurrences across 72 scans) were fixed on 2026-11-27, and the baseline in `known-findings.json` is now empty. The gate therefore fails on any axe violation in the scanned states, in both themes and both viewport sizes.

Fixes: visible text is now the accessible name for the brand link, Review links (count read as "N due"), flashcards and Progress day links; mastery bars are named images; unit meters are progress bars; dimmed landing steps no longer lower text contrast; row numbers and keyboard hints use `--ink-2`; flashcard and listening screens have a level-one heading.
