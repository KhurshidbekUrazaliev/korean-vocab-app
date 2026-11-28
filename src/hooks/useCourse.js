import { matchPath, useLocation } from 'react-router-dom';
import { COURSES, courseFromPath } from '../data/index.js';
import { useProfile } from './useProfile.js';

/** Course URLs select the language. The shared welcome page follows the saved profile. */
export function useCourse() {
  const { pathname } = useLocation();
  const profile = useProfile();
  if (profile && matchPath('/welcome', pathname)) return COURSES[profile.course];
  return courseFromPath(pathname);
}
