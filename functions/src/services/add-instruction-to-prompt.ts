import { openai } from '../lib/open-ai';
import { addInstructionToPromptPrompt } from '../private/content';

// Function to add instruction to a small prompt
export const addInstructionToPrompt = async (context: string, mission: string, targetAudience: string): Promise<string> => {
  const prompt = await addInstructionToPromptPrompt(context, mission, targetAudience);

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
