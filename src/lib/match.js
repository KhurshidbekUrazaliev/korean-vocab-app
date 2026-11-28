import { shuffle } from './shuffle.js';

// Compare visible labels without changing the spelling shown on the cards.
const labelKey = (text) => typeof text === 'string'
  ? text.trim().normalize('NFC').replace(/\s+/g, ' ').toLowerCase()
  : '';

/** Build up to five pairs by default. Each column is shuffled independently. */
export function buildMatchRound(words, { pairs = 5, random = Math.random } = {}) {
  const left = [];
  const right = [];
  const limit = Math.floor(pairs);
  if (!(limit > 0)) return { left, right };

  const ids = new Set();
  const terms = new Set();
  const meanings = new Set();
  for (const word of shuffle(words, random)) {
    const id = word?.id;
    const term = word?.term ?? word?.korean;
    const termKey = labelKey(term);
    const meaningKey = labelKey(word?.english);
    if (typeof id !== 'string' || !id.trim() || !termKey || !meaningKey) continue;
    if (ids.has(id) || terms.has(termKey) || meanings.has(meaningKey)) continue;

    ids.add(id);
    terms.add(termKey);
    meanings.add(meaningKey);
    left.push({ id, text: term });
    right.push({ id, text: word.english });
    if (left.length === limit) break;
  }

  return { left: shuffle(left, random), right: shuffle(right, random) };
}

/** Either column carries the original word id. An unselected card has no pair. */
export function isPair(leftId, rightId) {
  return typeof leftId === 'string' && Boolean(leftId.trim()) && leftId === rightId;
}
