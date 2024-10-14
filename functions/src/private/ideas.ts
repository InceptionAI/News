export const get10RootIdeasPrompt = async (
  mission: string,
  targetAudience: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive a context consisting of a subject, a mission, and a target audience.
    result should be in JSON format

    - Each idea should only be a few words long.
    - Each idea should be unique, non-repetitive AND HAVE A DIFFERENT THEME.
    - You will generate 10 ideas related to the subject, mission, and target audience.
    - This should be a list of subjects that can be further developed into articles.
    - The ideas should be in the language provided in the subject.
    - You will return an array of 10 ideas.
    - The mission should no be mentioned, it should only be used to guide the nature of the ideas.
    `,
    user: `Here's the mission: "${mission}", the target audience: "${targetAudience}".
    Make sure the ideas are unique, non-repetitive, and have a different theme.`,
  };
};

export const get10IdeasFromIdeaPrompt = async (
  idea: string,
  mission: string,
  targetAudience: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive a context consisting of a idea, a mission, and a target audience.
      The idea you receive will be the core of the 10 shorts ideas you will generate.
      result should be in json format

      - Ideas must Not be generic, they must be interesting and engaging.
      - Each idea should be a few words long, not more then 5 words.
      - You will generate 10 new ideas related to the core subject.
      - Each idea should be unique, non-repetitive AND HAVE A DIFFERENT THEME.
      - Ideas should be short and concise.
      - This should be a list of subjects that can be further developed into articles for online referencing.
      - The ideas should be unique and interesting.
      - The ideas should be in the language provided.
      - You will return an array of 10 ideas.
      - Each idea should engage the target audience.
      - The mission should no be mentioned, it should only be used to guide the nature of the ideas.
      - The idea should have a wider scope than the idea.



      Each idea should only be a few words long.
        `,
    user: `Here's the idea: ${idea}, the mission: ${mission}, the target audience: ${targetAudience}.`,
  };
};

// export const getNextArticleIdeasPrompt = async (
//   ideas: string[],
//   mission: string,
//   targetAudience: string,
// ): Promise<{ system: string; user: string }> => {
//   return {
//     system: `You will receive a list of ideas, a mission, and a target audience.
//       You will receive a list of 100 ideas, you will pick the 7 best ideas for the user to pick from.

//       The first idea should be the best one, the second idea should be the second best one, and so on.
//       Result should only be a list[] of 7 ideas.
//       Result must be type string[].

//       Here's what's make a good idea:
//       - Pick ideas the company would be advantageous to create content around.
//       - The idea should be interesting enough to create content around it.
//       - The idea should reflect the mission and target audience.
//       - The idea should engage the target audience.
//       - The mission should no be mentioned, it should only be used to guide the nature of the ideas.

//     `,
//     user: `Here's the mission: ${mission}, the target audience: ${targetAudience} and the list of 100 ideas: ${ideas}.`,
//   };
// };
