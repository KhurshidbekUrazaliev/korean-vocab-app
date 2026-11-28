import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import { days } from '../data/index.js';
import { useProgress } from '../hooks/useProgress.js';
import { pageMetadata, socialTags } from '../lib/pageMetadata.js';

export function PageHead() {
  const { pathname } = useLocation();
  const progress = useProgress();
  const info = pageMetadata(pathname, days, pathname === '/' && Object.keys(progress.words).length > 0);
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
