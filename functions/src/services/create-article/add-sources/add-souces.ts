import { openai } from '../../../lib/open-ai';
import { addSourcesPrompt, addSourcesToItemPrompt, findSourcesItemPrompt, parseUrlPrompt } from '../../../private/add-sources';
import { preprocessJSON } from '../../preprocessJSON';
import { checkUrl } from './check-url';

// Function to add sources to a text
export const addSources = async (source: string, mission: string, subject: string, targetAudience: string): Promise<string> => {
  let prompt = await findSourcesItemPrompt(source, mission, subject, targetAudience);

  const listKeyElementPrompt = await openai.chat.completions.create({
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

  const listKeyElement = listKeyElementPrompt.choices[0].message?.content;
  prompt = await addSourcesToItemPrompt(listKeyElement ?? 'error in listKeyElement', subject, targetAudience);

  const listOfSourcesPrompt = await openai.chat.completions.create({
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

  const listOfSources = listOfSourcesPrompt.choices[0].message?.content;

  prompt = await parseUrlPrompt(listOfSources ?? 'error in listOfSources');

  const urlParsedJSONRaw = await openai.chat.completions.create({
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

  const urlParsedString = urlParsedJSONRaw.choices[0].message?.content;
  const urlParsedObject = JSON.parse(preprocessJSON(urlParsedString as string) ?? '{}');
  const urlList: string[] = Object.values(urlParsedObject);
  filterValidDomains(urlList).then((validDomains) => {
    console.log(validDomains); // Output: List of valid domains
  });
  console.log('urlList: ', urlList);
  prompt = await addSourcesPrompt(source, urlList, listKeyElement ?? '', targetAudience);

  const articleWithSourcesPrompt = await openai.chat.completions.create({
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

  const ArticleWithSources = articleWithSourcesPrompt.choices[0].message?.content;

  return ArticleWithSources ?? 'No content generated';
};

async function filterValidDomains(domainList: string[]): Promise<string[]> {
  console.log('Checking domains:', domainList);
  const results = await Promise.all(
    domainList.map(async (domain) => {
      const isValid = await checkUrl(domain);
      console.log('Domain:', domain, 'is valid:', isValid);
      return isValid ? domain : null;
    }),
  );
  console.log('Results:', results);
  return results.filter((domain): domain is string => domain !== null);
}
