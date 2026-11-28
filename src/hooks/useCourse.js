import { useLocation } from 'react-router-dom';
import { courseFromPath } from '../data/index.js';

/** The course a page belongs to, from its URL: /ar/... is Arabic, everything else Korean. */
export function useCourse() {
  return courseFromPath(useLocation().pathname);
}
