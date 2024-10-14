/**
 * This file contains the implementation of various API endpoints for the InceptionAI News application.
 * It includes functions for creating a new article, updating an image, publishing an article, and generating LinkedIn posts.
 * The API endpoints are implemented using the Express framework.
 */
import express from 'express';
import bodyParser from 'body-parser';
import { createNewArticle } from './services/create-article/create-new-article';
import { Locale, isValidLanguage, localesDetails } from './types/languages';
import { generateLinkedinPost } from './services/create-post/create-linkedin-post';
import { dbAdmin } from './lib/firebase-admin';
import { sendEmail } from './services/email/send-email';
import { emailContent } from './lib/email';
import { deleteUnpublishedArticle } from './services/firebase/delete-article-not-published';
import { createChartDataset } from './services/create-chart-dataset.ts/create-dataset';
import { get100Ideas } from './services/ideas/get-100-ideas';
import { ClientInfo } from './types/client-info';
import { createImage } from './services/image/create-image';
import { v4 as uuidv4 } from 'uuid';
import { getTranslation } from './services/create-article/get-translation';
import { Article } from './types/article';
import { generateTwitterPost } from './services/create-post/create-twitter-post';
import { Timestamp } from 'firebase-admin/firestore';
import { deleteImage } from './services/image/delete-image';
import { updateNextIdeas } from './services/ideas/update-next-ideas';

import { processDailyCronJob } from './cronjobs';

const app = express();

app.use(bodyParser.json());

//TODO: recall get100ideas if ideas is empty
app.post('/createNewArticle', async (req: express.Request, res: express.Response) => {
  let {
    prompt,
    source = false,
    clientId,
    lang,
    author,
    chart = true,
  } = req.body as {
    prompt: string;
    source: boolean;
    clientId: string;
    lang: Locale;
    author?: string;
    chart: boolean;
  };
  const path_info = `${clientId}/info`;
  const info = await dbAdmin.doc(path_info).get();

  if (!info.exists) {
    res.status(400).send('Client not found');
    return;
  }

  let { mission, ideas, targetAudience = 'general', defaultAuthor, CTA = '', domain, companyName } = info.data() as ClientInfo;

  if (!mission) {
    res.status(400).send('Client incomplete');
    return;
  }

  if (!author) {
    author = defaultAuthor ? defaultAuthor : companyName;
  }

  if (!mission || (!prompt && !ideas) || !clientId || !lang) {
    res.status(400).send('Missing required parameters');
    return;
  }

  if (!prompt) {
    const randomIndex = Math.floor(Math.random() * ideas.length);
    if (ideas.length === 0) {
      console.log('No ideas left, getting 100 new ideas');
      ideas = await get100Ideas(mission, targetAudience);
      await dbAdmin.doc(path_info).update({ ideas: ideas });
    }
    prompt = ideas[randomIndex];
    console.log('No prompt, idea picked: ', prompt);
    ideas.splice(randomIndex, 1);
    await dbAdmin.doc(path_info).update({
      ideas: ideas,
    });
    // addInstructions = true;
  }
  if (!isValidLanguage(lang)) {
    res.status(400).send('Invalid language');
    return;
  }

  const id = await createNewArticle({
    mission,
    targetAudience,
    source,
    clientId,
    author,
    prompt,
    chart,
    CTA,
    domain,
  });

  res.status(200).send({ id, lang });
});

app.post('/update-image', async (req: express.Request, res: express.Response) => {
  let { title, clientId, id, lang } = req.body as {
    title: string;
    clientId: string;
    lang: string;
    id: string;
  };
  const path_info = `${clientId}/info`;
  const info = await dbAdmin.doc(path_info).get();
  const clientInfo = info.data() as ClientInfo | undefined;

  if (!title || !clientId || !id || !lang) {
    res.status(401).send('Article not found');
    return;
  }
  const snapshot = await dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).get();

  if (!snapshot.exists) {
    res.status(400).send('Article not found');
    return;
  }

  const data = snapshot.data();

  if (data?.thumbnail) {
    //delete this current image in firebase storage
    const data = snapshot.data();

    if (data?.thumbnail) {
      deleteImage(data.thumbnail);
    }
  }

  const { url, prompt } = await createImage({ subject: title, clientInfo, clientId });

  snapshot.ref.update({ thumbnail: url, prompt: { thumbnail: prompt } });

  // Update all translations
  for (const translateLang of ['en', 'fr'] as Locale[]) {
    if (translateLang === lang) {
      continue;
    } else {
      const translateSnapshot = await dbAdmin.doc(`${clientId}/${translateLang}/articles/${id}`).get();

      if (translateSnapshot.exists) {
        translateSnapshot.ref.update({ thumbnail: url, prompt: { thumbnail: prompt } });
      }
    }
  }

  res.status(200).send(`Successfully updated image for article ${id}`);
});

app.post('/publish', async (req: express.Request, res: express.Response) => {
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

  // linkedinPost_v2 = await generateLinkedinPost({
  //   content: `Context:
  //   "${data.prompt.content}"
  //   Here's a structure of subjects we're able to cover in that post:
  //   [${html.match(/<h2(?: id="[^"]+")?>(.+?)<\/h2>/g)?.map((subtitle) => subtitle.replace(/<[^>]*>?/gm, ''))}]
  //   `,
  //   image,
  //   href: href.includes('clientId') ? href : `${href}?clientId=${clientId}`,
  //   locale: localesDetails[lang],
  //   info,
  // });

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

app.post('/get-linkedin-post', async (req: express.Request, res: express.Response) => {
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

app.post('/send-post-to-email', async (req: express.Request, res: express.Response) => {
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

app.post('/unpublish', async (req: express.Request, res: express.Response) => {
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

app.delete('/deleteUnpublishedArticle', async (req: express.Request, res: express.Response) => {
  const { clientId, lang, secret, id } = req.body as {
    clientId: string;
    lang: Locale;
    secret: string;
    id: string;
  };

  if (!clientId || !lang || !id) {
    res.status(400).send('Missing required parameters');
    return;
  }

  if (secret !== 'secret') {
    console.log('Invalid secret');
    res.status(400).send("Invalid secret, stop trying to hack me. Please don't do that.");
    return;
  }
  try {
    await deleteUnpublishedArticle(clientId, lang, id);

    // Delete all translations
    for (const translateLang of ['en', 'fr'] as Locale[]) {
      if (translateLang === lang) {
        continue;
      } else {
        await deleteUnpublishedArticle(clientId, translateLang, id);
      }
    }
    res.status(200).send('Unpublished article deleted successfully.');
  } catch (error) {
    console.error('Error deleting article:', error);
    res.status(500).send('Error deleting article');
  }
});

app.get('/update-chart-dataset', async (req: express.Request, res: express.Response) => {
  const { clientId, lang, id } = req.body as { clientId: string; lang: Locale; id: string };

  if (!clientId || !lang || !id) {
    res.status(400).send('Missing required parameters');
    return;
  }

  const docRef = dbAdmin.doc(`${clientId}/${lang}/articles/${id}`);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    res.status(400).send('Article not found');
    return;
  }

  const context = snapshot.data()?.content as string;

  const dataset = await createChartDataset(context);

  await docRef.update({ dataset });

  res.status(200).send(dataset);
});

app.post('/update-next-ideas', async (req: express.Request, res: express.Response) => {
  const { clientId, nextIdeas } = req.body as { clientId: string; nextIdeas: any[] };

  if (!clientId || !nextIdeas) {
    res.status(400).send({ error: 'Invalid or missing input data' });
    return;
  }
  const refInfo = `${clientId}/info`;
  const snapshotInfo = await dbAdmin.doc(refInfo).get();
  const info = snapshotInfo.data() as ClientInfo | undefined;

  // Validate nextIdeas array
  if (!Array.isArray(nextIdeas) || !info) {
    res.status(400).send({ error: 'Invalid or missing input data' });
    return;
  }

  try {
    // Call the `updateNextIdeas` function to handle the logic and update Firestore
    await updateNextIdeas(info, nextIdeas);

    res.status(200).send({ message: 'nextIdeas successfully updated' });
  } catch (error: any) {
    console.error('Error updating nextIdeas:', error);
    res.status(400).send({ error: error.message });
  }
});

app.post('/get-translations', async (req: express.Request, res: express.Response) => {
  try {
    const { clientId, lang, id } = req.body as { clientId: string; lang: Locale; id: string };
    const snapshot = await dbAdmin.doc(`${clientId}/${lang}/articles/${id}`).get();

    if (!snapshot.exists) {
      res.status(400).send('Article not found');
      return;
    }
    const article = snapshot.data() as Article | undefined;

    if (!article) {
      res.status(400).send('Article not found');
      return;
    }

    const hardcodedClientLang = ['en', 'fr'] as Locale[];

    for (const translateLang of hardcodedClientLang) {
      const translateSnapshot = await dbAdmin.doc(`${clientId}/${translateLang}/articles/${id}`).get();
      if (translateSnapshot.exists) {
        continue;
      } else {
        await getTranslation(article, clientId, translateLang);
      }
    }
    res.status(200).send('Translations generated');
  } catch (e) {
    console.error('Error getting translations:', e);
    res.status(500).send(e);
  }
});

app.get('/get-100-ideas', async (req: express.Request, res: express.Response) => {
  const { clientId } = req.body as { clientId: string };

  if (!clientId) {
    res.status(400).send('Missing clientId');
    return;
  }

  const docRef = dbAdmin.doc(`${clientId}/info`);

  const snapshot = await docRef.get();

  if (!snapshot.exists) {
    res.status(400).send('Language or clientId not found');
    return;
  }
  const { mission, targetAudience } = snapshot.data() as { mission: string; targetAudience: string };

  const data = await get100Ideas(mission, targetAudience);
  const shuffleArray = (data: string[]): string[] => {
    return data.sort(() => Math.random() - 0.5);
  };

  await docRef.update({ ideas: shuffleArray(data) });

  res.status(200).send(data);
});

app.get('/ping', async (req: express.Request, res: express.Response) => {
  res.status(200).send('Pong');
});

//export app for firebase functions
export default app;

//TODO number left
app.post('/setup-client', async (req: express.Request, res: express.Response) => {
  console.log('req.body', req.body);
  let { mission, companyName, targetAudience, stylePreferences, CTA = '', domain = '', clientId } = req.body as ClientInfo;

  if (!mission || !companyName || !targetAudience || !stylePreferences) {
    res.status(400).send('Missing required parameters');
    return;
  }

  if (clientId) {
    const docRef = dbAdmin.doc(`${clientId}/info`);
    const snapshot = await docRef.get();
    if (snapshot.exists) {
      const data = snapshot.data() as ClientInfo;
      res.status(201).json({ ...data, clientId });
      return;
    }
  }
  clientId = uuidv4().replaceAll('-', '');
  const docRef = dbAdmin.doc(`${clientId}/info`);

  let ideas100 = await get100Ideas(mission, targetAudience);
  let nextIdeas = ideas100.slice(0, 7);
  ideas100 = ideas100.filter((idea) => !nextIdeas.includes(idea));

  const newNextIdeas = nextIdeas.map((title) => ({
    title: title,
  }));

  const info = {
    mission,
    companyName,
    targetAudience,
    stylePreferences,
    nextIdeas: newNextIdeas,
    ideas: ideas100,
    domain,
    CTA,
  };
  await docRef.set({ ...info, creationDate: Timestamp.now() });
  res.status(200).json({ ...info, clientId });
});

// Add this code after your existing endpoints

app.post('/finish-setup', async (req, res) => {
  let { clientId, info } = req.body as { clientId: string; info: ClientInfo };

  // Check if clientId is provided
  if (!clientId || !info) {
    res.status(400).send('Missing params');
    return;
  }

  const docRef = dbAdmin.doc(`${clientId}/info`);
  const snapshot = await docRef.get();

  // Check if the client exists
  if (!snapshot.exists || !info?.nextIdeas) {
    res.status(404).send('Client not found');
    return;
  }
  info.nextIdeas = await updateNextIdeas(info, info?.nextIdeas, true);

  if (!info.nextIdeas) {
    res.status(400).send('Failed to update nextIdeas');
    return;
  }

  await docRef.set(info, { merge: true });

  //TODO: Append first next ideas to cronjobs/nextIdeas
  const cronjobsRef = dbAdmin.collection('cronjobs').doc('nextIdeas');
  const cronjobs = await cronjobsRef.get();
  const cronjobClient = cronjobs.data()?.[clientId] ?? null;
  console.log('cronjobClient', cronjobClient);

  if (!cronjobClient) {
    await cronjobsRef.set({ [clientId]: { date: info.nextIdeas[0].date } });
  } else {
    console.error('Client already exists in cronjobs');
  }

  res.status(200).json({ message: 'Setup finished successfully', clientId });
});

app.post('/updateNextIdeas', async (req: express.Request, res: express.Response) => {
  const { clientId, lang, newNextIdeas } = req.body as { clientId: string; lang: Locale; newNextIdeas: string[] };

  if (!clientId || !lang || !newNextIdeas) {
    return res.status(400).send({ error: 'Invalid or missing input data' });
  }

  try {
    const docRef = dbAdmin.doc(`${clientId}/info`);

    await docRef.update({
      nextIdeas: newNextIdeas,
    });

    return res.status(200).send({ message: 'nextIdeas successfully updated' });
  } catch (error) {
    console.error('Error updating nextIdeas:', error);
    return res.status(500).send({ error: 'Failed to update nextIdeas' });
  }
});

// TODO: Test incomplet, à revoir, url à changer, etc.
app.post('/trigger-daily-cronjob', async (req, res) => {
  try {
    await processDailyCronJob();
    res.status(200).send('Cron job triggered successfully');
  } catch (error) {
    console.error('Error triggering cron job:', error);
    res.status(500).send('Error triggering cron job');
  }
});
