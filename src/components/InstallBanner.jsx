import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { TLink } from './Motion.jsx';
import { Close, Download, Share } from './Icons.jsx';
import { promptInstall, useInstall } from '../hooks/useInstall.js';

const KEY = 'kv.install.dismissed';
const SNOOZE_DAYS = 14;
const icon = `${import.meta.env.BASE_URL}icon-192.png`;

const snoozed = () => {
  try {
    return Date.now() - Number(localStorage.getItem(KEY) || 0) < SNOOZE_DAYS * 86_400_000;
  } catch {
    return false;
  }
};

/** Offers to install the web app a moment after the site opens. "Not now" hides it for two weeks. */
export function InstallBanner() {
  const { canPrompt, iosManual } = useInstall();
  const { pathname } = useLocation();
  const [ready, setReady] = useState(false);
  const [hidden, setHidden] = useState(snoozed);

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  if (!ready || hidden || pathname === '/install' || !(canPrompt || iosManual)) return null;

  const dismiss = () => {
    try {
      localStorage.setItem(KEY, String(Date.now()));
    } catch {
      /* private mode: hide for this visit only */
    }
    setHidden(true);
  };

  return (
    <aside className="install-banner card" aria-labelledby="install-banner-title">
      <img src={icon} alt="" width="48" height="48" className="install-banner__icon" />
      <div className="install-banner__text">
        <p id="install-banner-title"><b>Install Essential Vocabulary</b></p>
        {canPrompt ? (
          <p className="muted">Open it like an app, in its own window. Pages you have opened also work offline.</p>
        ) : (
          <p className="muted">
            Tap <Share width={16} height={16} className="install-banner__inline" /> <b>Share</b>, then <b>Add to Home Screen</b>.
          </p>
        )}
      </div>
      <div className="install-banner__actions">
        {canPrompt ? (
          <button type="button" className="btn btn--accent" onClick={async () => (await promptInstall()) === 'dismissed' && dismiss()}>
            <Download width={18} height={18} /> Install
          </button>
        ) : (
          <TLink className="btn btn--ghost" to="/install">How to install</TLink>
        )}
        <button type="button" className="icon-btn icon-btn--plain" onClick={dismiss} aria-label="Not now">
          <Close width={18} height={18} />
        </button>
      </div>
    </aside>
  );
}
