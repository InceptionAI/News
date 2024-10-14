import { dbAdmin } from '../../lib/firebase-admin';
import { openai } from '../../lib/open-ai';
import { Article } from '../../types/article';
import { Locale, localesDetails } from '../../types/languages';
import { getTranslationPrompt } from '../../private/translation';

//TODO: Finish this function, not working yet
export const getTranslation = async (article: Article, clientId: string, lang: Locale): Promise<void> => {
  try {
    const locale = localesDetails[lang];
    const cleanedArticle = {
      ...article,
      author: undefined,
      created: undefined,
      href: undefined,
      id: undefined,
      prompt: undefined,
      published: undefined,
      thumbnail: undefined,
    };
    const prompts = await getTranslationPrompt(locale, cleanedArticle);

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: prompts.system,
        },
        {
          role: 'user',
          content: prompts.user,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0].message?.content;

    if (!content) {
      throw new Error('Failed to generate a translation');
    }

    const data = JSON.parse(content) as any;

    data.author = article.author;
    data.created = article.created;
    data.href = article.href.replace('/en-', `/${locale.languageCode}-`);
    data.id = article.id;
    if (article?.prompt) {
      data.prompt = article.prompt;
    }
    data.published = article.published;
    data.thumbnail = article.thumbnail;

    const docRefTranslate = dbAdmin.doc(`${clientId}/${lang}/articles/${data.id}`);

    await docRefTranslate.set(data);
    // await docRef.set({ translations: { [lang]: data.id } }, { merge: true });
  } catch (error) {
    console.error('Failed to generate translation', error);
  }
};
