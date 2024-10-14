'use server';

import { dbAdmin } from '../../lib/firebase-admin';
import { Article } from '../../types/article';
import { Locale } from '../../types/languages';
import { getTranslation } from './get-translation';

const hardcodedClientLang = ['en', 'fr'] as Locale[];

export const addArticle = async (article: Article, clientId: string, lang: Locale): Promise<void> => {
  try {
    const docRef = dbAdmin.doc(`${clientId}/${lang}/articles/${article.id}`);

    if ((await docRef.get()).exists) {
      console.log('Document already exists, at second verification');
      return;
    }

    await docRef.set(article);

    for (const translateLang of hardcodedClientLang) {
      if (translateLang === lang) {
        continue;
      } else {
        await getTranslation(article, clientId, translateLang);
      }
    }
  } catch (error) {
    console.error('add-article.ts: Error adding article:', error);
  }
};
