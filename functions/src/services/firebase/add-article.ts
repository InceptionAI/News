'use server';

import { dbAdmin } from '../../lib/firebase-admin';
import { Article } from '../../types/article';

export const addArticle = async (article: Article, clientId: string, lang: string): Promise<void> => {
  try {
    const docRef = dbAdmin.doc(`${clientId}/${lang}/articles/${article.id}`);

    if ((await docRef.get()).exists) {
      console.log('Document already exists');
      return;
    }

    console.log('Article added at:', docRef.path);

    await docRef.set(article);
  } catch (error) {
    console.error('add-article.ts: Error adding article:', error);
  }
};
