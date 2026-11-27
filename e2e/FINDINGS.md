# Accessibility findings for the UI owner

Playwright Chromium 159 and axe-core 4.14.0 reported these issues on the production build with reduced motion. The checked-in baseline identifies each affected node and state. The CI artifact contains the HTML, measured colors, selectors and axe guidance for every occurrence.

| Location | Finding and repair |
| --- | --- |
| Header on landing, Course, Day, Review, Today, Progress and the 404 page | The home link’s accessible name omits the visible Korean brand name. Include the visible label. When a word is due, check that the desktop and mobile Review link names include the rendered label and count in the same order. |
| Landing, four practice steps | On desktop, steps 2–4 render at 40% opacity under reduced motion. Their numbers, headings, mode labels and explanations measure 1.82–3.34:1 against the page. Use foreground colors and opacity that give each text size the required contrast. |
| Landing, mobile dark theme | The flashcard demo’s back-face romanization measures 1.84:1. Set a readable foreground for the light reverse face and check the rendered demo. |
| Course and Today | The five generic unit-meter divs use a prohibited accessible name. Provide appropriate progress semantics with a value and a label. The Today mastery indicator shares the generic-span issue described below. |
| Day 01 word list | All ten 12px row numbers measure 3.31:1 in light and 4.02:1 in dark. Use a text color meeting 4.5:1. Each mastery span carries an accessible name on a role that cannot be named. Expose the mastery level through meaningful text or an appropriate semantic element. |
| Flashcards | The accessible name on the flip button differs from its visible text. Ensure the current face’s visible label is available in its accessible name, and that the hidden face stays out of that name. |
| Practice feedback and flashcards, dark theme | The keyboard hint on the primary button can measure 3.88:1 at 11px. Check the resting button for both the flashcard front and wrong-answer feedback. |
| Progress day chart | Day 1 and 5 links show a single digit while their accessible names use zero-padded numbers. Make the visible and accessible labels agree. |
| Flashcard and listening sessions | Axe’s heading best-practice rule reports no level-one heading when a flashcard is showing or when listening audio is available. Give the session a descriptive heading. |

Standalone forward/reverse multiple choice and typing, including typing-error feedback, had no automated violations in the measured states. After repairing a finding, rerun both themes and viewport sizes, remove its resolved exact baseline entries and run the regression gate again.
