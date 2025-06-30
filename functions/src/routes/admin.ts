import express from 'express';
import { deleteUnpublishedArticle } from '../services/firebase/delete-article-not-published';
import { createChartDataset } from '../services/create-chart-dataset.ts/create-dataset';
import { get100Ideas } from '../services/ideas/get-100-ideas';
import { updateNextIdeas } from '../services/ideas/update-next-ideas';
import { getTranslation } from '../services/create-article/get-translation';
import { processDailyCronJob } from '../cronjobs';
import { dbAdmin } from '../lib/firebase-admin';
import { Locale } from '../types/languages';
import { ClientInfo } from '../types/client-info';
import { Article } from '../types/article';
import { Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

router.delete('/deleteUnpublishedArticle', async (req: express.Request, res: express.Response) => {
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

router.get('/update-chart-dataset', async (req: express.Request, res: express.Response) => {
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

router.post('/update-next-ideas', async (req: express.Request, res: express.Response) => {
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

router.post('/get-translations', async (req: express.Request, res: express.Response) => {
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

router.get('/get-100-ideas', async (req: express.Request, res: express.Response) => {
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

//TODO number left
router.post('/setup-client', async (req: express.Request, res: express.Response) => {
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

router.post('/finish-setup', async (req, res) => {
  let { clientId, selectedDate, info } = req.body as { clientId: string; selectedDate: string; info: ClientInfo };

  info.startDate = Timestamp.fromDate(new Date(selectedDate));

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
  info.nextIdeas = await updateNextIdeas(info, info?.nextIdeas, docRef, true);

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

router.post('/updateNextIdeas', async (req: express.Request, res: express.Response) => {
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
router.post('/trigger-daily-cronjob', async (req, res) => {
  try {
    await processDailyCronJob();
    res.status(200).send('Cron job triggered successfully');
  } catch (error) {
    console.error('Error triggering cron job:', error);
    res.status(500).send('Error triggering cron job');
  }
});

export default router;
