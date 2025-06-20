import { openai } from '../../lib/open-ai';
import { linkedinSecretPrompt, translateLinkedinSecret } from '../../private/linkedin';
import { ClientInfo } from '../../types/client-info';
import { LocaleDetails } from '../../types/languages';

export const generateLinkedinPost = async ({
  context,
  href,
  locale,
  info,
}: {
  context: string;
  href: string;
  locale: LocaleDetails;
  info: ClientInfo;
}): Promise<string[] | null> => {
  try {
    const prompt = linkedinSecretPrompt(context, href, locale.language, info);

    const completion = await openai.chat.completions.create({
      model: 'o1-mini',
      messages: [
        {
          role: 'user',
          content: `${prompt.system}\n\n
          ${prompt.user}`,
        },
      ],
    });

    const response = completion.choices[0].message?.content?.replaceAll('```html', '').replaceAll('```', '');

    if (!response) {
      return null;
    }
    const cleanedResponse = response
      .replace(/```[\s\S]*?```/g, '')
      .replace(/^[^{[]*/, '')
      .replace(/[^}\]]*$/, '')
      .trim();

    try {
      let list = JSON.parse(cleanedResponse) as string[];

      for (const lang of ['French', 'English']) {
        if (lang !== locale.language) {
          try {
            const prompt = translateLinkedinSecret(list, lang);

            const completion = await openai.chat.completions.create({
              model: 'gpt-4o-mini',
              messages: [
                {
                  role: 'system',
                  content: prompt.system,
                },
                {
                  role: 'user',
                  content: prompt.user,
                },
              ],
            });

            const content = completion.choices[0].message?.content;
            console.log('Translated content:', content);

            if (!content) {
              console.error('create-linkedin-post.ts: Failed to translate:', completion);
              continue;
            }
            const contentWithTranslation = content
              ?.replaceAll('```html', '')
              .replaceAll('```', '')
              .replace(/```[\s\S]*?```/g, '')
              .replace(/^[^{[]*/, '')
              .replace(/[^}\]]*$/, '')
              .trim();

            const data = JSON.parse(contentWithTranslation) as string[];

            console.log('Translated data:', data);

            list = list.map(
              (current, i) => current + '<hr style="border: none; border-top: 2px solid #ffffff; margin: 20px 0;">' + data[i],
            );
          } catch (error) {
            console.error('Failed to translate:', error);
          }
        }
      }

      return list;
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      return null;
    }
  } catch (error) {
    console.error('Error in generateLinkedinPost', error);
    return null;
  }
};
