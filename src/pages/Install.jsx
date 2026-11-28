import { useState } from 'react';
import { TLink } from '../components/Motion.jsx';
import { ArrowRight, Check, Download, Share } from '../components/Icons.jsx';
import { promptInstall, useInstall } from '../hooks/useInstall.js';
import { useProfile } from '../hooks/useProfile.js';
import { COURSES } from '../data/index.js';
import { BRAND } from '../data/brand.js';
import '../styles/app.css';

const icon = `${import.meta.env.BASE_URL}icon-512.png`;

/** The shareable install link: one button where the browser allows it, steps everywhere else. */
export default function Install() {
  const { installed, canPrompt, iosManual } = useInstall();
  const profile = useProfile();
  const [outcome, setOutcome] = useState(null);
  const home = COURSES[profile?.course ?? 'ko'].path('/');

  return (
    <article className="install-page wrap">
      <header className="install-page__head">
        <img src={icon} alt={`${BRAND} app icon`} width="128" height="128" className="install-page__icon" />
        <div>
          <p className="eyebrow">Web app</p>
          <h1 className="display">Install {BRAND}.</h1>
          <p className="lede">
            Add the app to your phone, tablet or computer. It opens in its own window from your home screen or app list, and the
            pages you have opened also work without a connection. Your profile and progress stay on the device.
          </p>
        </div>
      </header>

      <section className="install-page__action card" aria-live="polite">
        {installed || outcome === 'accepted' ? (
          <>
            <p className="install-page__done"><Check /> Installed. Open it from your home screen or app list.</p>
            <TLink className="btn btn--lg btn--ghost" to={home}>Back to the app <ArrowRight /></TLink>
          </>
        ) : canPrompt ? (
          <>
            <button type="button" className="btn btn--lg btn--accent" onClick={async () => setOutcome(await promptInstall())}>
              <Download /> Install the app
            </button>
            <p className="muted">Free. No account, no app store.</p>
          </>
        ) : iosManual ? (
          <p className="install-page__ios">
            On iPhone and iPad: tap <Share width={18} height={18} /> <b>Share</b> in Safari, then <b>Add to Home Screen</b>.
          </p>
        ) : (
          <p className="muted">
            Your browser does not offer installation from this page. Use the steps below for your device.
            {outcome === 'dismissed' && ' You can install it later from the same place.'}
          </p>
        )}
      </section>

      <section className="install-page__steps" aria-labelledby="install-steps">
        <h2 className="h3" id="install-steps">Steps by device</h2>
        <ol className="install-steps">
          <li className="card">
            <b>iPhone and iPad</b>
            <span>Open this page in Safari. Tap Share, then Add to Home Screen, then Add.</span>
          </li>
          <li className="card">
            <b>Android</b>
            <span>Open this page in Chrome. Tap Install app in the banner, or open the ⋮ menu and choose Install app.</span>
          </li>
          <li className="card">
            <b>Computer</b>
            <span>Open this page in Chrome or Edge. Click the install icon at the right end of the address bar, or use the button above.</span>
          </li>
        </ol>
      </section>
    </article>
  );
}
