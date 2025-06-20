import { openai } from '../../../lib/open-ai';
import { getIntroPrompt } from '../../../private/intro';

// Function to generate content for a subtitle
export const createContentForIntro = async (
  subtitle: string,
  mission: string,
  subject: string,
  targetAudience: string,
  listSubtitle: string[],
): Promise<string> => {
  const prompt = await getIntroPrompt(subtitle, mission, subject, targetAudience, listSubtitle);

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
