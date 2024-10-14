import { openai } from '../../../lib/open-ai';
import { improveBodyPrompt } from '../../../private/body';

// Function to improve the body of the article
export const improveBody = async (body: string, listSubtitle: string[], context: string): Promise<string> => {
  const prompt = await improveBodyPrompt(body, listSubtitle, context);

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
