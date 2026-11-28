import { describe, it, expect, vi } from 'vitest';
import { createProgressStore } from '../../hooks/useProgress.js';
import { compactProgress, emptyProgress, loadProgress, localDateKey, PROGRESS_KEY } from '../progress.js';
import { CHECKPOINT_KEY, COMPACT_AFTER, JOURNAL_PREFIX } from '../progressJournal.js';
import { schedule } from '../srs.js';

function memoryStorage() {
  const data = new Map();
  return {
    get length() { return data.size; },
    key: i => [...data.keys()][i] ?? null,
    getItem: key => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    removeItem: key => data.delete(key),
  };
}

describe('cross-tab progress', () => {
  it('merges same-word and different-word answers, daily totals and both session modes from two stale tabs', () => {
    const storage = memoryStorage();
    const a = createProgressStore(storage);
    const b = createProgressStore(storage);
    a.recordAnswer('one', true);
    b.recordAnswer('two', true);
    a.recordAnswer('one', true);
    b.recordAnswer('one', false);
    a.recordSession('day01', 'choice', 7, 10);
    b.recordSession('day01', 'flashcards', 9, 10);
    b.recordSession('day02', 'choice', 8, 10);
    const result = loadProgress(storage);
    expect(result).toMatchObject({
      words: { one: { box: 1, seen: 3, correctCount: 2 }, two: { box: 2, seen: 1, correctCount: 1 } },
      daily: { [localDateKey()]: 4 }, activity: [localDateKey()],
      days: { day01: { best: 90, modes: ['choice', 'flashcards'] }, day02: { best: 80 } },
    });
    a.refresh();
    expect(a.get()).toEqual(result);
  });

  it('reloads synchronous grades with a held lock and recovers an interrupted cleanup without double counting', async () => {
    const storage = memoryStorage();
    let compact;
    const lock = vi.fn(fn => { compact = fn; });
    const a = createProgressStore(storage, lock);
    for (let i = 0; i < COMPACT_AFTER; i++) a.recordAnswer('one', true);
    await Promise.resolve();
    expect(lock).toHaveBeenCalledTimes(1);
    expect(storage.getItem(CHECKPOINT_KEY)).toBeNull();
    expect(loadProgress(storage).words.one.seen).toBe(COMPACT_AFTER);

    const remove = storage.removeItem;
    let removed = 0;
    storage.removeItem = key => {
      if (++removed === 3) throw new Error('Tab closed');
      remove(key);
    };
    expect(compact).toThrow('Tab closed');
    expect(loadProgress(storage).words.one.seen).toBe(COMPACT_AFTER);
    storage.removeItem = remove;
    const b = createProgressStore(storage);
    b.recordAnswer('one', false);
    compactProgress(storage);
    expect(storage.length).toBe(1);
    expect(loadProgress(storage).words.one).toMatchObject({ seen: COMPACT_AFTER + 1, correctCount: COMPACT_AFTER, box: 1 });
    expect(createProgressStore(storage).get()).toEqual(b.get());
  });

  it('imports later legacy v2 counter advances once, even if a stale snapshot briefly goes backwards', () => {
    const storage = memoryStorage();
    const now = new Date();
    const date = localDateKey(now);
    const first = schedule(undefined, true, now);
    const old = { ...emptyProgress(), words: { w: first }, activity: [date], daily: { [date]: 1 } };
    storage.setItem(PROGRESS_KEY, JSON.stringify(old));
    const a = createProgressStore(storage);
    a.recordAnswer('w', true);
    compactProgress(storage);
    const later = { ...old, words: { w: schedule(first, false, now), z: first }, daily: { [date]: 3 } };
    storage.setItem(PROGRESS_KEY, JSON.stringify(later));
    a.refresh();
    expect(a.get()).toMatchObject({ words: { w: { box: 1, seen: 3, correctCount: 2 }, z: { seen: 1 } }, daily: { [date]: 4 } });
    a.recordAnswer('w', true);
    compactProgress(storage);
    storage.setItem(PROGRESS_KEY, JSON.stringify(old));
    a.recordAnswer('w', true);
    compactProgress(storage);
    storage.setItem(PROGRESS_KEY, JSON.stringify(later));
    expect(loadProgress(storage)).toMatchObject({ words: { w: { seen: 5, correctCount: 4 } }, daily: { [date]: 6 } });
  });

  it('counts an earlier pending grade without undoing a later schedule from a legacy tab', () => {
    const storage = memoryStorage();
    const store = createProgressStore(storage);
    vi.useFakeTimers();
    try {
      vi.setSystemTime(new Date('2026-02-11T01:00:00Z'));
      store.recordAnswer('w', false);
      const at = new Date('2026-02-11T02:00:00Z');
      const later = schedule(undefined, true, at);
      storage.setItem(PROGRESS_KEY, JSON.stringify({ ...emptyProgress(), words: { w: later } }));
      expect(loadProgress(storage).words.w).toEqual({ ...later, seen: 2 });
      compactProgress(storage);
      expect(loadProgress(storage).words.w).toEqual({ ...later, seen: 2 });
    } finally { vi.useRealTimers(); }
  });

  it('preserves a legacy tab write arriving during v1/v2 migration', () => {
    const storage = memoryStorage();
    const prior = { ...emptyProgress(), words: { a: schedule(undefined, true) } };
    const concurrent = { ...prior, words: { ...prior.words, b: schedule(undefined, true) } };
    storage.setItem(PROGRESS_KEY, JSON.stringify(prior));
    storage.setItem('kv.progress.v1', JSON.stringify({ version: 1, activity: ['2026-01-01'] }));
    const get = storage.getItem;
    storage.getItem = key => {
      if (key === 'kv.progress.v1') storage.setItem(PROGRESS_KEY, JSON.stringify(concurrent));
      return get(key);
    };
    loadProgress(storage);
    expect(JSON.parse(get(PROGRESS_KEY))).toEqual(concurrent);
    expect(loadProgress(storage).words).toEqual(concurrent.words);
  });

  it('keeps unwritable answers in memory and persists them when compaction frees space', async () => {
    const storage = memoryStorage();
    let compact;
    const store = createProgressStore(storage, fn => { compact = fn; });
    const set = storage.setItem;
    storage.setItem = (key, value) => {
      if (key.startsWith(JOURNAL_PREFIX) && storage.length >= 2) throw new Error('Quota full');
      return set(key, value);
    };
    store.recordAnswer('w', true);
    store.recordAnswer('w', true);
    store.recordAnswer('w', false);
    expect(store.get().words.w.seen).toBe(3);
    expect(loadProgress(storage).words.w.seen).toBe(2);
    await Promise.resolve();
    compact();
    expect(loadProgress(storage).words.w.seen).toBe(3);
  });
});
