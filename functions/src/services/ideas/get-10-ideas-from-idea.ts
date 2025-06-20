import { openai } from '../../lib/open-ai';
import { get10IdeasFromIdeaPrompt } from '../../private/ideas';
import { preprocessJSON } from '../preprocessJSON';

// Function to generate a list of 10 ideas to a given context
export const get10IdeasFromIdea = async (idea: string, mission: string, targetAudience: string): Promise<any> => {
  const prompt = await get10IdeasFromIdeaPrompt(idea, mission, targetAudience);

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    response_format: { type: 'json_object' },
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

  const result = preprocessJSON(completion.choices[0].message?.content ?? '');

  if (!result) {
    return [];
  }
  try {
    JSON.parse(result);
  } catch (error) {
    console.log('Error parse in get-10-root-ideas.ts: ', error);
    return [];
  }
  const data: string[] = JSON.parse(result);

  return data;
};
