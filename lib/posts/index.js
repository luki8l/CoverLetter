import { meta as meta1 } from './how-to-write-a-cover-letter.jsx';
import { meta as meta2 } from './ai-cover-letter-generator.jsx';
import { meta as meta3 } from './ats-cover-letter.jsx';
import { meta as meta4 } from './bewerbungsschreiben-ki.jsx';
import { meta as meta5 } from './follow-up-email-after-interview.jsx';

export const allPosts = [meta1, meta2, meta3, meta4, meta5];

export async function getPost(slug) {
  const map = {
    'how-to-write-a-cover-letter':       () => import('./how-to-write-a-cover-letter.jsx'),
    'ai-cover-letter-generator':          () => import('./ai-cover-letter-generator.jsx'),
    'ats-cover-letter':                   () => import('./ats-cover-letter.jsx'),
    'bewerbungsschreiben-ki':             () => import('./bewerbungsschreiben-ki.jsx'),
    'follow-up-email-after-interview':    () => import('./follow-up-email-after-interview.jsx'),
  };

  const loader = map[slug];
  if (!loader) return null;

  const mod = await loader();
  return { meta: mod.meta, Content: mod.default };
}
