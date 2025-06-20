export const getBodyPrompt = async (
  subtitle: string,
  mission: string,
  context: string,
  targetAudience: string,
  listSubtitle: string[],
): Promise<{ system: string; user: string }> => {
  return {
    system: `Create a text, this text is a section of an article.
      It should respect the requirement that follow:
      "
      - This section should have a minimum of 4 paragraphs.
      - Each paragraph will be short and concise, to be easy to read.
      - You will be given a subtitle of the article and the mission of the article, the text must reflect of those.
      - You will also be given a context, this context will act as a set of instructions for the text you will create.
      - Make sure the content is related to the mission of the article: "${mission}".
      - Your task is to generate engaging and informative content for the subtitle.
      - The content should be designed to hold the reader’s attention and provide valuable information without overwhelming them.
      - The text output is destined to bring organic traffic to a website.
      - It should have a lot of different keywords related to the context.
      - The people that will read the text don't necessarily have a lot of knowledge on the subject.
      - You should grab the readers attention with genuine interest in helping them.
      - Make a one liner closing sentence to transition to the next subtitle.
      -  Here's a list of the subtitle of this article to help you do logical transition between the content, 
      they are in order, so the subtitle next to ${subtitle} in the list is the subtitle of the next paragraph of the article: ${listSubtitle}.
      - Don't mention the target audience in the text, this is only to guide the narration.
      `,
    user: `
      Create content for the subtitle "${subtitle}, your target audience for this is: "${targetAudience}, the mission is: "${mission}".
      The context of the article is, use the context as instructions: "${context}".
      `,
  };
};

export const improveBodyPrompt = async (
  content: string,
  listOfSubtitles: string[],
  context: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive the body of an article, you will improve it with the requirements that follow:
      - Make sure the text is not redundant, easy to read, without big paragraph.
      - Each part of the body must have at least 4 paragraphs.
      - Make logic transition each part of the body.
      - Develop and explain each ideas.
      - Make sure that the information of the text is display is various way.
      - Make sure bullet points are used in the text. Add them in a MAXIMUM of 2 or 3 SECTIONS.
      - Make sure that the text looks like a professional article made by a human.
      - Make sure that the different section doesn't have the same structure, make sure that the different section don't look alike.
      - You will need to separate the text in small paragraphs.
      - Check the length of each paragraph, if one one is too long, split it.
      - The text output is destined to bring organic traffic to a website.
      `,
    user: `Here's the content of the body of the article: "${content}" and the multiple subtitles of the article: ${listOfSubtitles}.
      Your main job is to make sure the text is not redundant.
      Make sure the body respect the instruction of the context: "${context}".
      `,
  };
};
