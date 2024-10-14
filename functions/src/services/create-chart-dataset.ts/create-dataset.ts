import { openai } from '../../lib/open-ai';
import { createDatasetPrompt } from '../../private/chart';

// Function to generate a dataset to a given prompt (named context)
export const createChartDataset = async (prompt: string, type?: 'bar' | 'pie') => {
  const prompts = await createDatasetPrompt(prompt, type);

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

  return content ?? 'No content generated';
};
