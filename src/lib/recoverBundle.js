// Kept bundles cover the previous release. A much older tab verifies a new entry
// is available before recovering a missing dynamic import by reloading its route.
export function installBundleRecovery() {
  const entry = document.querySelector('script[type="module"][src]')?.src;
  if (!entry) return;
  let checking = false;
  window.addEventListener('vite:preloadError', async () => {
    if (checking || !navigator.onLine) return;
    checking = true;
    try {
      if (sessionStorage.getItem('kv.reloadedEntry') === entry) return;
      const response = await fetch(import.meta.env.BASE_URL, { cache: 'no-store' });
      if (!response.ok) return;
      const html = new DOMParser().parseFromString(await response.text(), 'text/html');
      const next = html.querySelector('script[type="module"][src]')?.getAttribute('src');
      if (next && new URL(next, response.url).href !== entry) {
        sessionStorage.setItem('kv.reloadedEntry', entry);
        location.reload();
      }
    } catch {
      // Keep the current route if connectivity or browser storage is unavailable.
    } finally {
      checking = false;
    }
  });
}
