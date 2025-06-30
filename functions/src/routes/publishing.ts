import express from 'express';
import { generateLinkedinPost } from '../services/create-post/create-linkedin-post';
import { generateTwitterPost } from '../services/create-post/create-twitter-post';
import { sendEmail } from '../services/email/send-email';
import { emailContent } from '../lib/email';
import { createImage } from '../services/image/create-image';
import { dbAdmin } from '../lib/firebase-admin';
import { Locale, localesDetails } from '../types/languages';
import { ClientInfo } from '../types/client-info';

const router = express.Router();

router.post('/publish', async (req: express.Request, res: express.Response) => {
  let { href, clientId, lang, id } = req.body as {
    href: string;
    clientId: string;
    lang: Locale;
    id: string;
    thumbnail?: string;
  };

  if (!href || !clientId) {
    res.status(400).send('Missing required parameters');
    return;
  }

  const snapshot = await dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).get();

  if (!snapshot.exists) {
    res.status(400).send('Article not found');
    return;
  }

  const data = snapshot.data();

  if (!data) {
    res.status(400).send('Article not found');
    return;
  }

  const html = data?.content.replace(/<[^>]*>/g, '') as string;
  const title = data?.content.match(/<h1(?: id="[^"]+")?>(.+?)<\/h1>/)?.[1] ?? '';

  if (!html) {
    res.status(400).send('Article not found or missing content');
    return;
  }

  const refInfo = `${clientId}/info`;
  const snapshotInfo = await dbAdmin.doc(refInfo).get();
  const info = snapshotInfo.data() as ClientInfo | undefined;

  if (!info) {
    console.log('No cliendId');
    res.status(400).send('Article not found or missing content');
    return;
  }

  if (!data?.thumbnail) {
    try {
      const { url, prompt } = await createImage({ subject: title, clientInfo: info, clientId });

      data.thumbnail = url;
      data.prompt.thumbnail = prompt;
    } catch (error: any) {
      console.error('/publish: Error creating image:', error.message);
    }
  }

  let linkedinPosts: string[] | null = null;
  let twitterPost: string | null = null;

  linkedinPosts = await generateLinkedinPost({
    context: html.replace(/<[^>]*>/g, ''),
    href,
    locale: localesDetails[lang],
    info,
  });

  if (info.allowed?.twitter) {
    twitterPost = await generateTwitterPost(html.replace(/<[^>]*>/g, ''), href, localesDetails[lang]);
  }

  //TODO: add a email wrapper
  const email = emailContent({
    lang,
    subject: title,
    linkedinPosts,
    twitterPosts: twitterPost ? [twitterPost] : null,
    href: href.includes('clientId') ? href : `${href}?clientId=${clientId}`,
    thumbnail: data.thumbnail,
  });

  if (!email) {
    res.status(400).send('Failed to generate email content');
    return;
  }

  await sendEmail(email);
  await snapshot.ref.update({ published: true, thumbnail: data.thumbnail });
  await snapshot.ref.set(
    {
      prompt: { thumbnail: data.prompt.thumbnail },
      posts: {
        linkedin: linkedinPosts,
        twitter: twitterPost,
      },
    },
    { merge: true },
  );

  for (const translateLang of ['en', 'fr'] as Locale[]) {
    if (translateLang === lang) {
      continue;
    } else {
      const translateSnapshot = await dbAdmin.doc(`${clientId}/${translateLang}/articles/${id}`).get();

      if (translateSnapshot.exists) {
        await translateSnapshot.ref.update({ published: true, thumbnail: data.thumbnail });
        await translateSnapshot.ref.set(
          {
            prompt: { thumbnail: data.prompt.thumbnail },
            posts: {
              linkedin: linkedinPosts,
              twitter: twitterPost,
            },
          },
          { merge: true },
        );
      }
    }
  }

  res.status(200).send('New article published');
});

router.post('/unpublish', async (req: express.Request, res: express.Response) => {
  //    body: JSON.stringify({ lang: lang.slice(0, 2), id, secret }),
  let { lang, id, clientId, secret } = req.body as {
    clientId: string;
    lang: 'en' | 'fr';
    id: string;
    secret: string;
  };

  if (secret !== 'secret') {
    console.log('Invalid secret');
    res.status(400).send('Error while unpublishing article');
    return;
  }

  if (!clientId) {
    console.log('Missing required parameters');
    res.status(400).send('Error while unpublishing article');
    return;
  }

  const snapshot = await dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).get();

  if (!snapshot.exists) {
    console.log('Article not found');
    res.status(400).send('Error while unpublishing article');
    return;
  }

  snapshot.ref.update({ published: false });

  for (const translateLang of ['en', 'fr'] as Locale[]) {
    if (translateLang === lang) {
      continue;
    } else {
      const translateSnapshot = await dbAdmin.doc(`${clientId}/${translateLang}/articles/${id}`).get();

      if (translateSnapshot.exists) {
        translateSnapshot.ref.update({ published: false });
      }
    }
  }

  res.status(200).send('Article unpublished');
});

export default router;
