import { openai } from '../../../lib/open-ai';
import { getListOfSubjectSecretPrompt } from '../../../private/content';
import { preprocessJSON } from '../../preprocessJSON';

export const getListSubtitle = async (
  context: string,
  targetAudience: string,
  mission: string,
  title: string,
): Promise<string[]> => {
  const prompt = await getListOfSubjectSecretPrompt(context, targetAudience, mission, title);

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

  const result = preprocessJSON(completion.choices[0].message?.content ?? '');

  if (!result) {
    return [];
  }
  try {
    JSON.parse(result);
  } catch (error) {
    console.log('Error parse in get-list-subcategories.ts: ', error);
    return [];
  }
  const data: string[] = JSON.parse(result);

  return data;
};
