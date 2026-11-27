import { TLink } from './Motion.jsx';
import { days, allWords } from '../data/index.js';

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__motto" lang="ko">
            하루에 열 단어.
            <span>Ten words a day, {days.length} days, {allWords.length} words.</span>
          </p>
          <ul className="footer__links">
            <li><TLink to="/course">Course</TLink></li>
            <li><TLink to="/review" ko="복습" en="Review">Review</TLink></li>
            <li><TLink to="/progress">Progress</TLink></li>
            <li><TLink to="/privacy">Privacy</TLink></li>
            <li><TLink to="/terms">Terms</TLink></li>
          </ul>
        </div>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Essential Korean Vocabulary</span>
          <span>No account needed. Progress is saved in this browser.</span>
        </div>
      </div>
    </footer>
  );
}
