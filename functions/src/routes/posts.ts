import express from 'express';
import { generateLinkedinPost } from '../services/create-post/create-linkedin-post';
import { sendEmail } from '../services/email/send-email';
import { emailContent } from '../lib/email';
import { dbAdmin } from '../lib/firebase-admin';
import { Locale, localesDetails } from '../types/languages';
import { ClientInfo } from '../types/client-info';

const router = express.Router();

router.post('/get-linkedin-post', async (req: express.Request, res: express.Response) => {
  try {
    const { clientId, lang, id, href, receiver } = req.body as {
      clientId: string;
      lang: Locale;
      id: string;
      href: string;
      receiver?: string;
    };

    if (!clientId || !lang || !id) {
      res.status(400).send('Missing required parameters');
      return;
    }

    const snapshot = await dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).get();

    if (!snapshot.exists) {
      res.status(400).send('Article not found');
      return;
    }

    const data = snapshot.data();

    if (!data || !data.published) {
      res.status(400).send('Article not found');
      return;
    }

    const html = data?.content.replace(/<[^>]*>/g, '') as string;

    if (!html) {
      res.status(400).send('Article not found or missing content');
      return;
    }

    const title = data?.content.match(/<h1(?: id="[^"]+")?>(.+?)<\/h1>/)?.[1] ?? '';

    if (!title) {
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

    const linkedinPosts = await generateLinkedinPost({
      context: html,
      href,
      locale: localesDetails[lang],
      info,
    });

    const email = emailContent({
      lang,
      subject: title,
      linkedinPosts,
      href: href.includes('clientId') || clientId === process.env.CLIENT_ID ? href : `${href}?clientId=${clientId}`,
      thumbnail: data.thumbnail,
    });

    if (!email) {
      res.status(400).send('Failed to generate email content');
      return;
    }

    await sendEmail(email, receiver);

    dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).update({ posts: { linkedin: linkedinPosts } });

    for (const translateLang of ['en', 'fr'] as Locale[]) {
      if (translateLang === lang) {
        continue;
      } else {
        const translateSnapshot = await dbAdmin.doc(`${clientId}/${translateLang}/articles/${id}`).get();

        if (translateSnapshot.exists) {
          const translateData = translateSnapshot.data();

          if (translateData?.published) {
            const translateHtml = translateData?.content.replace(/<[^>]*>/g, '') as string;

            if (!translateHtml) {
              res.status(400).send('Article not found or missing content');
              return;
            }

            const translateLinkedinPosts = await generateLinkedinPost({
              context: translateHtml,
              href,
              locale: localesDetails[translateLang],
              info,
            });

            dbAdmin.doc(`${clientId}/${translateLang}/articles/${id}`).update({ posts: { linkedin: translateLinkedinPosts } });
          }
        }
      }
    }

    res.status(200).send('Linkedin post sent: ' + linkedinPosts);
  } catch (error) {
    console.error('Error getting Linkedin post:', error);
    res.status(500).send('Error getting Linkedin post');
  }
});

router.post('/send-post-to-email', async (req: express.Request, res: express.Response) => {
  const { clientId, lang, id, href, receiver } = req.body as {
    clientId: string;
    lang: Locale;
    id: string;
    href: string;
    receiver: string;
  };

  if (!clientId || !lang || !id) {
    res.status(400).send('Missing required parameters');
    return;
  }

  const snapshot = await dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).get();

  if (!snapshot.exists) {
    res.status(400).send('Article not found');
    return;
  }

  const data = snapshot.data();

  if (!data || !data.published) {
    res.status(400).send('Article not found');
    return;
  }

  const title = data?.content.match(/<h1(?: id="[^"]+")?>(.+?)<\/h1>/)?.[1] ?? '';

  if (!title) {
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

  const email = emailContent({
    lang,
    subject: title,
    linkedinPosts: data.posts?.linkedin,
    twitterPosts: data.posts?.twitter ? [data.posts.twitter] : null,
    href: href.includes('clientId') || clientId === process.env.CLIENT_ID ? href : `${href}?clientId=${clientId}`,
    thumbnail: data.thumbnail,
  });

  if (!email) {
    res.status(400).send('Failed to generate email content');
    return;
  }

  await sendEmail(email, receiver);

  res.status(200).send('Email sent');
});

export default router;
