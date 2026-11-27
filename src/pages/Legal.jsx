const SITE = 'https://khurshidbekurazaliev.github.io/korean-vocab-app';

export function Privacy() {
  return (
    <article className="prose-page wrap">
      <title>Privacy | Essential Korean Vocabulary</title>
      <meta name="description" content="What Essential Korean Vocabulary stores about you: only your practice progress, kept in your own browser." />
      <link rel="canonical" href={`${SITE}/privacy`} />
      <div className="prose">
        <h1 className="display">Privacy</h1>
        <p>Last updated 27 November 2026.</p>
        <h2>What is stored</h2>
        <p>Your practice progress (which words you answered, when they are due for review, your streak) and your light or dark theme choice. Both are saved in your browser’s local storage on your device. They are never sent to us or anyone else.</p>
        <h2>No accounts, no tracking</h2>
        <p>The site has no sign-up, no analytics, no advertising and no tracking cookies.</p>
        <h2>Third parties</h2>
        <p>The site is hosted on GitHub Pages, which may log basic request data such as IP addresses as described in GitHub’s privacy statement. The font is loaded from the jsDelivr CDN. Pronunciation uses your device’s built-in speech voice; the audio is generated on your device.</p>
        <h2>Deleting your data</h2>
        <p>Clear this site’s data in your browser settings to remove all saved progress.</p>
        <h2>Contact</h2>
        <p><span className="todo">TODO(owner): contact email for privacy questions</span></p>
      </div>
    </article>
  );
}

export function Terms() {
  return (
    <article className="prose-page wrap">
      <title>Terms of use | Essential Korean Vocabulary</title>
      <meta name="description" content="Terms for using Essential Korean Vocabulary, a free Korean word practice site." />
      <link rel="canonical" href={`${SITE}/terms`} />
      <div className="prose">
        <h1 className="display">Terms of use</h1>
        <p>Last updated 27 November 2026.</p>
        <h2>Using the site</h2>
        <p>Essential Korean Vocabulary is a free study tool. You may use it for personal learning. Please don’t copy the site or its word lists to republish them elsewhere.</p>
        <h2>Accuracy</h2>
        <p>Word lists are checked carefully, but mistakes can happen. Translations give the common meanings of a word, not every meaning. If you find an error, please report it.</p>
        <h2>No warranty</h2>
        <p>The site is provided as is, without any warranty. Your saved progress lives in your browser and can be lost if browser data is cleared.</p>
        <h2>Owner and contact</h2>
        <p><span className="todo">TODO(owner): legal name of the site owner, country, and contact email</span></p>
      </div>
    </article>
  );
}
