import { useSyncExternalStore } from 'react';

// The sign-in is a profile saved on this device only: no server, no password.
const KEY = 'kv.profile';
export const GOALS = [10, 20, 30];
const listeners = new Set();
let cached;

function read() {
  try {
    const p = JSON.parse(localStorage.getItem(KEY));
    if (p && typeof p.name === 'string' && (p.course === 'ko' || p.course === 'ar')) {
      return { goal: 20, ...p, goal: GOALS.includes(p.goal) ? p.goal : 20 };
    }
  } catch {
    /* No storage or a damaged entry: treat as signed out. */
  }
  return null;
}

function emit() {
  cached = read();
  listeners.forEach((l) => l());
}

export const profileStore = {
  get() {
    if (cached === undefined) cached = read();
    return cached;
  },
  save(profile) {
    const next = { goal: 20, createdAt: new Date().toISOString(), ...profileStore.get(), ...profile };
    next.name = next.name.trim().slice(0, 40);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* Private mode: keep it for this visit only. */
      cached = next;
      listeners.forEach((l) => l());
      return next;
    }
    emit();
    return next;
  },
  setCourse(course) {
    const p = profileStore.get();
    if (p && p.course !== course) profileStore.save({ course });
  },
  subscribe(listener) {
    listeners.add(listener);
    const onStorage = (e) => e.key === KEY && emit();
    window.addEventListener('storage', onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener('storage', onStorage);
    };
  },
};

export function useProfile() {
  return useSyncExternalStore(profileStore.subscribe, profileStore.get, () => null);
}
