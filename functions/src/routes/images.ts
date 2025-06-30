import express from 'express';
import { createImage } from '../services/image/create-image';
import { saveImageStorage } from '../services/image/save-image-storage';
import { deleteImage } from '../services/image/delete-image';
import { ClientInfo } from '../types/client-info';
import { dbAdmin } from '../lib/firebase-admin';
import { Locale } from '../types/languages';

const router = express.Router();

router.post('/update-image', async (req: express.Request, res: express.Response) => {
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

router.post('/save-image-storage', async (req: express.Request, res: express.Response) => {
  try {
    const { url, clientId, subject } = req.body as {
      url: string;
      clientId: string;
      subject: string;
    };

    if (!url || !clientId || !subject) {
      res.status(400).send('Missing required parameters: url, clientId, and subject are required');
      return;
    }

    const publicUrl = await saveImageStorage(url, clientId, subject);

    res.status(200).json({
      success: true,
      publicUrl,
      message: 'Image saved successfully',
    });
  } catch (error) {
    console.error('Error saving image to storage:', error);
    res.status(500).send('Error saving image to storage');
  }
});

export default router;
