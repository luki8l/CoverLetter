import { meta as meta1 } from './how-to-write-a-cover-letter.jsx';
import { meta as meta2 } from './ai-cover-letter-generator.jsx';
import { meta as meta3 } from './ats-cover-letter.jsx';
import { meta as meta4 } from './bewerbungsschreiben-ki.jsx';
import { meta as meta5 } from './follow-up-email-after-interview.jsx';
import { meta as meta6 } from './ai-for-cover-letter.jsx';
import { meta as meta7 } from './cover-letter-no-experience.jsx';
import { meta as meta8 } from './how-to-start-a-cover-letter.jsx';
import { meta as meta9 } from './anschreiben-vorlage.jsx';
import { meta as meta10 } from './software-engineer-cover-letter.jsx';
import { meta as meta11 } from './cover-letter-examples.jsx';

export const allPosts = [meta1, meta2, meta3, meta4, meta5, meta6, meta7, meta8, meta9, meta10, meta11];

export async function getPost(slug) {
  const map = {
    'how-to-write-a-cover-letter':       () => import('./how-to-write-a-cover-letter.jsx'),
    'ai-cover-letter-generator':          () => import('./ai-cover-letter-generator.jsx'),
    'ats-cover-letter':                   () => import('./ats-cover-letter.jsx'),
    'bewerbungsschreiben-ki':             () => import('./bewerbungsschreiben-ki.jsx'),
    'follow-up-email-after-interview':    () => import('./follow-up-email-after-interview.jsx'),
    'ai-for-cover-letter':                () => import('./ai-for-cover-letter.jsx'),
    'cover-letter-no-experience':         () => import('./cover-letter-no-experience.jsx'),
    'how-to-start-a-cover-letter':        () => import('./how-to-start-a-cover-letter.jsx'),
    'anschreiben-vorlage':                () => import('./anschreiben-vorlage.jsx'),
    'software-engineer-cover-letter':     () => import('./software-engineer-cover-letter.jsx'),
    'cover-letter-examples':              () => import('./cover-letter-examples.jsx'),
  };

  const loader = map[slug];
  if (!loader) return null;

  const mod = await loader();
  return { meta: mod.meta, Content: mod.default };
}
