import { TLink } from './Motion.jsx';
import { useCourse } from '../hooks/useCourse.js';

export function Footer() {
  const course = useCourse();
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <p className="footer__motto">
            <span lang={course.lang} dir={course.dir}>{course.motto}</span>
            <span className="footer__sub">
              {course.name}: ten words a day, {course.days.length} days, {course.allWords.length} words.
            </span>
          </p>
          <ul className="footer__links">
            <li><TLink to={course.path('/course')}>Course</TLink></li>
            <li><TLink to={course.path('/letters')}>Letters</TLink></li>
            <li><TLink to={course.path('/review')} native={course.reviewNative} en="Review">Review</TLink></li>
            <li><TLink to="/privacy">Privacy</TLink></li>
            <li><TLink to="/terms">Terms</TLink></li>
          </ul>
        </div>
        <div className="footer__legal">
          <span>© {new Date().getFullYear()} Essential Vocabulary</span>
          <span>
            Developed by Khurshidbek · <a href="mailto:ummahfaris@gmail.com">ummahfaris@gmail.com</a>
          </span>
          <span>No account needed. Your profile and progress stay on this device.</span>
        </div>
      </div>
    </footer>
  );
}
