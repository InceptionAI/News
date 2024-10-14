import { openai } from '../../../lib/open-ai';
import { editContentPrompt } from '../../../private/content';

// Function to edit the content of an article and format it
export const editContent = async (
  article: string,
  subtitleList: string[],
  greatestTitle: string,
  context: string,
): Promise<string> => {
  const prompt = await editContentPrompt(article, subtitleList, greatestTitle, context);

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

  return content ?? 'No content generated';
};
