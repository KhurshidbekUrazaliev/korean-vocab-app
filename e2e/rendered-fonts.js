import assert from 'node:assert/strict';

// Runs in the page. Use glyphs from visible course text so a test cannot
// accidentally download a font that real navigation would never use.
function findSample(family) {
  const glyph = family === 'Noto Serif KR' ? /[가-힣]/ : /[A-Za-z]/;
  const text = document.createTreeWalker(document.getElementById('root'), NodeFilter.SHOW_TEXT);
  while (text.nextNode()) {
    if (!glyph.test(text.currentNode.data)) continue;
    const element = text.currentNode.parentElement;
    const firstFamily = getComputedStyle(element).fontFamily.split(',')[0].replace(/["']/g, '').trim();
    if (firstFamily === family && element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return element;
  }
  return null;
}

export async function renderedFonts(page, session) {
  // The font stylesheets load without blocking the first paint (preload, then rel=stylesheet).
  // Wait until both are applied and their faces have loaded before inspecting glyphs.
  await page.waitForFunction(() => {
    const pending = document.querySelector('link[rel="preload"][as="style"]');
    const families = new Set([...document.fonts].filter(f => f.status === 'loaded').map(f => f.family.replace(/["']/g, '')));
    return !pending && document.fonts.status === 'loaded' && families.has('Pretendard Variable');
  });
  await session.send('DOM.getDocument');
  const samples = {};
  try {
    for (const family of ['Pretendard Variable', 'Noto Serif KR']) {
      const { result } = await session.send('Runtime.evaluate', {
        expression: `(${findSample})(${JSON.stringify(family)})`, objectGroup: 'audit-fonts',
      });
      if (!result.objectId && family === 'Noto Serif KR') continue;
      assert.ok(result.objectId, `No visible ${family} text on ${page.url()}`);
      const { nodeId } = await session.send('DOM.requestNode', { objectId: result.objectId });
      const { fonts } = await session.send('CSS.getPlatformFontsForNode', { nodeId });
      const used = fonts.find(font => font.isCustomFont && font.glyphCount > 0 &&
        (font.familyName === family || font.familyName.startsWith(family + ' ')));
      assert.ok(used, `Expected ${family} to render text on ${page.url()}, found ${fonts.map(f => f.familyName).join(', ')}`);
      samples[family] = used.familyName;
    }
  } finally {
    await session.send('Runtime.releaseObjectGroup', { objectGroup: 'audit-fonts' });
  }
  return samples;
}
