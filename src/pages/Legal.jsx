
export function Privacy() {
  return (
    <article className="prose-page wrap">
      <div className="prose">
        <h1 className="display">Privacy</h1>
        <p>Last updated 28 November 2026.</p>
        <h2>What is stored</h2>
        <p>Your practice progress (which words you answered, when they are due for review, your streak), your light or dark theme choice and whether practice sound effects are on. All of it is saved in your browser’s local storage on your device. They are never sent to us or anyone else.</p>
        <h2>No accounts, no tracking</h2>
        <p>The site has no sign-up, no analytics, no advertising and no tracking cookies.</p>
        <h2>Third parties</h2>
        <p>The site is hosted on GitHub Pages, which may log basic request data such as IP addresses as described in GitHub’s privacy statement. Fonts are loaded from the jsDelivr CDN (Pretendard) and Google Fonts (Noto Serif KR), which receive your IP address when the fonts download. Pronunciation plays short recorded audio files served from this site, made in advance with an open text-to-speech model. If a file can’t load, your device’s built-in speech voice is used instead, and that audio is generated on your device.</p>
        <h2>Deleting your data</h2>
        <p>Clear this site’s data in your browser settings to remove all saved progress.</p>
        <h2>Contact</h2>
        <p>
          Questions about privacy: email Khurshidbek at <a href="mailto:ummahfaris@gmail.com">ummahfaris@gmail.com</a>.
        </p>
      </div>
    </article>
  );
}

export function Terms() {
  return (
    <article className="prose-page wrap">
      <div className="prose">
        <h1 className="display">Terms of use</h1>
        <p>Last updated 28 November 2026.</p>
        <h2>Using the site</h2>
        <p>Essential Korean Vocabulary is a free study tool. You may use it for personal learning. Please don’t copy the site or its word lists to republish them elsewhere.</p>
        <h2>Accuracy</h2>
        <p>Word lists are checked carefully, but mistakes can happen. Translations give the common meanings of a word, not every meaning. If you find an error, please report it.</p>
        <h2>No warranty</h2>
        <p>The site is provided as is, without any warranty. Your saved progress lives in your browser and can be lost if browser data is cleared.</p>
        <h2>Owner and contact</h2>
        {/* TODO(owner): add the country the site is run from, if wanted. */}
        <p>
          The site is developed and run by Khurshidbek. To report an error in a word list or ask a question, email{' '}
          <a href="mailto:ummahfaris@gmail.com">ummahfaris@gmail.com</a>.
        </p>
      </div>
    </article>
  );
}
