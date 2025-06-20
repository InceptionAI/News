import { openai } from '../../../lib/open-ai';
import { improveConclusionPrompt } from '../../../private/conclusion';

// Function to generate content for a subtitle
export const improveConclusion = async (
  subtitle: string,
  mission: string,
  prompt: string,
  targetAudience: string,
  listSubtitle: string[],
  CTA: string,
  domain: string,
  conclusion: string,
): Promise<string> => {
  const prompts = await improveConclusionPrompt(subtitle, mission, prompt, targetAudience, listSubtitle, CTA, domain, conclusion);

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

  return content ?? 'No content generated';
};
