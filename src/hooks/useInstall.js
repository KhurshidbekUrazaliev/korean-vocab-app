import { useSyncExternalStore } from 'react';

// Installing the web app. Chrome, Edge and Android browsers fire `beforeinstallprompt`
// when the site can be installed; the app keeps that event and shows it on request.
// Safari on iPhone and iPad has no prompt: learners add the app from the Share menu.
const listeners = new Set();
let deferred = null;
let installedNow = false;
let snapshot = null;

const isBrowser = typeof window !== 'undefined';

export const isStandalone = () =>
  isBrowser && (window.matchMedia?.('(display-mode: standalone)').matches || window.navigator.standalone === true);

export const isIosSafari = () => {
  if (!isBrowser) return false;
  const ua = navigator.userAgent;
  const ios = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  return ios && /safari/i.test(ua) && !/crios|fxios|edgios/i.test(ua);
};

function emit() {
  snapshot = null;
  listeners.forEach((l) => l());
}

if (isBrowser) {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep the browser's mini-bar quiet; the app offers install itself
    deferred = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installedNow = true;
    emit();
  });
}

function read() {
  if (!snapshot) {
    const installed = installedNow || isStandalone();
    snapshot = {
      installed,
      canPrompt: !installed && Boolean(deferred),
      iosManual: !installed && isIosSafari(),
    };
  }
  return snapshot;
}

/** Show the browser's install dialog. Resolves to 'accepted', 'dismissed' or 'unavailable'. */
export async function promptInstall() {
  if (!deferred) return 'unavailable';
  const event = deferred;
  deferred = null; // a prompt event can only be used once
  emit();
  event.prompt();
  const { outcome } = await event.userChoice;
  return outcome;
}

export function useInstall() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    read,
    () => ({ installed: false, canPrompt: false, iosManual: false }),
  );
}
