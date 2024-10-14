import { openai } from '../../../lib/open-ai';
import { createSEOTitlePrompt } from '../../../private/content';

// Function to generate a great SEO title
export const createSEOTitle = async (prompt: string, targetAudience: string, mission: string, lang: string): Promise<string> => {
  const prompts = await createSEOTitlePrompt(prompt, targetAudience, mission, lang);

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
  });

  const content = completion.choices[0].message?.content;

  return content ? content.replaceAll('"', '') : 'No content generated';
};
