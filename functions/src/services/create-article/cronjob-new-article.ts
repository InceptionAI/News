import { Timestamp } from 'firebase-admin/firestore';
import { dbAdmin } from '../../lib/firebase-admin';
import { ClientInfo } from '../../types/client-info';
import { createNewArticle } from './create-new-article';
import { createdArticleEmail } from '../email/cronjob-email';
import { handleNewNextIdeas } from '../ideas/remove-new-next-ideas';

export const handleNewArticle = async (clientId: string, date: Timestamp): Promise<Timestamp | void> => {
  const path_info = `${clientId}/info`;
  const ref = dbAdmin.doc(path_info);
  const snapshot = await ref.get();
  if (!snapshot.exists) {
    console.log('Client info does not exist');
    return;
  }
  const info = snapshot.data() as ClientInfo;

  if (!info) {
    console.log('Client data does not exist');
    return;
  }

  let {
    mission,
    nextIdeas,
    targetAudience = 'general',
    defaultAuthor,
    CTA = '',
    domain,
    defaultLang = 'en',
  } = info as ClientInfo;

  // Find the prompt where idea.date is the same day as date
  const prompt = nextIdeas?.find((idea) => {
    const ideaDate = new Date(idea.date.toMillis());
    const targetDate = new Date(date.toMillis());

    const isSameDay =
      ideaDate.getFullYear() === targetDate.getFullYear() &&
      ideaDate.getMonth() === targetDate.getMonth() &&
      ideaDate.getDate() === targetDate.getDate();

    return isSameDay;
  })?.title;

  if (!prompt) {
    return;
  }

  console.log('creating article');
  const id = await createNewArticle({
    author: defaultAuthor ?? 'InceptionAI',
    clientId,
    domain,
    mission,
    prompt,
    targetAudience,
    CTA,
  });
  if (!id) {
    console.log('Error creating article');
    return;
  }
  await createdArticleEmail(clientId, defaultLang, id);
  console.log('Article created and email sent, congrats!');
  return await handleNewNextIdeas(info, mission, targetAudience);
};
