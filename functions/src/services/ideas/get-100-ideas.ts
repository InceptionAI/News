import { get10IdeasFromIdea } from './get-10-ideas-from-idea';
import { get10RootIdeas } from './get-10-root-ideas';

export const get100Ideas = async (mission: string, targetAudience: string): Promise<string[]> => {
  const rootIdeas = await get10RootIdeas(mission, targetAudience);
  console.log('rootIdeas', rootIdeas);
  const ideas = await Promise.all(
    rootIdeas.ideas.map(async (idea: string) => {
      const ideas = await get10IdeasFromIdea(idea, mission, targetAudience);

      return ideas.ideas;
    }),
  );

  return ideas.flat();
};
