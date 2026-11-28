import { statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { COURSES } from '../../data/index.js';
import { pageMetadata, SITE, socialTags } from '../pageMetadata.js';

describe.each(Object.values(COURSES))('$name sharing cards', course => {
  it('points both social previews at the published home and lesson images', () => {
    const prefix = '/og' + course.base;
    const pages = [
      [course.path('/'), prefix + '/home.jpg'],
      ...course.days.map(day => [course.path('/day/' + day.number),
        prefix + '/day' + String(day.number).padStart(2, '0') + '.jpg']),
    ];
    for (const [route, file] of pages) {
      const tags = socialTags(pageMetadata(route, COURSES));
      expect(tags['og:image'], route).toBe(SITE + file);
      expect(tags['twitter:image'], route).toBe(tags['og:image']);
      const { size } = statSync(new URL('../../../public' + file, import.meta.url));
      expect(size, file).toBeGreaterThan(0);
      expect(size, file).toBeLessThan(60000);
    }
  });
});
