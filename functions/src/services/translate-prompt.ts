import { openai } from '../lib/open-ai';

export const translate = async (context: string, lang: string): Promise<string> => {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'user',
        content: `Translate the following text to ${lang}: ${context}, word for word.`,
      },
    ],
  });

  const content = completion.choices[0].message?.content;

  return content ?? 'No content generated';
};
