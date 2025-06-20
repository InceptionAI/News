import { openai } from '../../../lib/open-ai';
import { getConclusionPrompt } from '../../../private/conclusion';

// Function to generate content for a subtitle
export const createContentForClosure = async (
  subtitle: string,
  mission: string,
  subject: string,
  targetAudience: string,
  listSubtitle: string[],
  CTA: string,
  domain: string,
): Promise<string> => {
  const prompt = await getConclusionPrompt(subtitle, mission, subject, targetAudience, listSubtitle, CTA, domain);

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
