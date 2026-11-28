import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { COURSES } from '../data/index.js';
import { useProfile } from '../hooks/useProfile.js';
import { pageMetadata, socialTags } from '../lib/pageMetadata.js';

export function PageHead() {
  const { pathname } = useLocation();
  const profile = useProfile();
  const info = pageMetadata(pathname, COURSES, Boolean(profile) && (pathname === '/' || pathname === '/ar'));
  return <>
    <title>{info.title}</title>
    <meta name="description" content={info.description} />
    {info.noindex ? <meta name="robots" content="noindex" /> : <link rel="canonical" href={info.url} />}
    {Object.entries(socialTags(info)).map(([name, content]) => name.startsWith('og:')
      ? <meta key={name} property={name} content={content} />
      : <meta key={name} name={name} content={content} />)}
    {info.jsonLd && createPortal(<script type="application/ld+json">{JSON.stringify(info.jsonLd)}</script>, document.head)}
  </>;
}
