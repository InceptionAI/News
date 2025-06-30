import express from 'express';
import { createNewArticle } from '../services/create-article/create-new-article';
import { Locale, isValidLanguage } from '../types/languages';
import { ClientInfo } from '../types/client-info';
import { dbAdmin } from '../lib/firebase-admin';

const router = express.Router();

//TODO: recall get100ideas if ideas is empty
router.post('/createNewArticle', async (req: express.Request, res: express.Response) => {
  let {
    prompt,
    source = false,
    clientId,
    lang = 'en',
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
    res.status(400).send('Missing required parameters');
    return;
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

export default router;
