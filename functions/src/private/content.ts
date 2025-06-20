// export const getContextPrompt = async (context: string): Promise<{ system: string; user: string }> => {
//   return {
//     system: `You will receive a context, your job is to create a mission and context for an article based on this context.
//     The mission is the goal of the article, it's what the article is trying to achieve.
//     The context is the main topic of the article, it's what the article is about.

//     IF THERE IS A IMPORTANT POINT TO MENTION, MAKE SURE TO INCLUDE IT IN THE MISSION OR THE context.
//     IF THERE ARE IMPORTANT POINTS TO ENUMERATE, MAKE SURE TO INCLUDE THEM IN THE MISSION OR THE context.

//     Your output MUST be in the following JSON format:
//     {
//       "mission": "Your mission here",
//       "context": "Your context here"
//     }
//     `,
//     user: `Here is the context you will use to create the mission and context for the article: ${context}
//     `,
//   };
// };

// export const createSEOTitlePrompt = async (
//   context: string,
//   targetAudience: string,
//   mission: string,
//   lang: string,
// ): Promise<{ system: string; user: string }> => {
//   return {
//     system: `You will receive a context, a mission and a target audience you will create a seo-friendly title for an article.
//     Take the subject as a whole to create the title, don't be specific to the article.
//     DON'T PUT ANY ACCENT IN THE TITLE. EX: "é" should be "e".
//     - there will be no whitespace.
//     - there should only be one word per section of the title : "word1-word2-word3".
//     - the 3 keywords must be the most important keywords of the article.
//     VERY IMPORTANT: IT SHOULD HAVE A MAXIMUM OF 4 KEYWORDS.
//     ONLY USE THE MOST IMPORTANT KEYWORDS.
//       SEO title must not have any adverb
//       or any useless word that are not necessary for the seo title, only use keyword for the SEO title,
//       also make sure that the seo title is in "${lang}"
//       - the seo title should use words that a "${targetAudience}" would use to search for the article.
//       - a great seo title have key word that a user would use to search for the article.
//       - the seo title will not have any whitespace or special character.
//       `,
//     user: `Create a great seo title in ${lang} for an article.
//     VERY IMPORTANT: IT SHOULD HAVE A MAXIMUM OF 4 KEYWORDS.
//     ONLY USE THE MOST IMPORTANT KEYWORDS.
//     EVERY KEYWORDS MUST BY SEPARATED BY A "-" (DASH).
//     Here is the context you will use to create the seo title: "${context}",
//     your target audience for this is: "${targetAudience}",
//     and the mission is: "${mission}".

//     Make sure the title is not exactly the same as the context. (should use different word)
//     The word of the seo title mush be composed of keyword that a user (target audience) would use to search for the article.`,
//   };
// };
export const createSEOTitlePrompt = async (
  prompt: string,
  targetAudience: string,
  mission: string,
  lang: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `Generate an SEO-friendly title for an article based on the provided context, mission, and target audience.=
    - Use the most relevant keywords that the target audience would likely search for.=
    - Avoid accents, adverbs, and unnecessary words.=
    `,

    user: `Create a concise SEO title for an article about "${prompt}".
    - Use the target audience: "${targetAudience}", and mission: "${mission}".
    - Ensure the title aligns with common search behavior and is not identical to the context.
    `,
  };
};

export const getListOfSubjectSecretPrompt = async (
  context: string,
  targetAudience: string,
  mission: string,
  seoTitle: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `Use the context to create subtitles for an article, while following the instructions of the context,
    you're a professional on the subject.
    The requirement for your task are the following:
    - Make sure the subtitles don't repeat the same information.
    - Each subtitle must be seo-friendly and contain keywords related to the context.
    - You can choose the number of subtitle you think you be best (using the given information (target audience, mission, context)),
    but keep the number of subtitle under 6 subtitles maximum.
    - Each subtitle must have a distinct and clear meaning.
    - Result must be in JSON format.
    - Always add an adapted introduction and conclusion to the list of subtitles.
    - only return a list of content, nothing else.
    - Simply output a JavaScript-like Object Notation list of subtitle.
    - Don't mention the target audience, this is only to guide the narration.
    - Only return an array of subtitle, nothing else.
    `,
    user: `Write an array of subtitle for the following context: "${context}".
    Your target audience is"${targetAudience}", and the mission is: "${mission}".
    You have a SEO title you can use for addition information: "${seoTitle}".
    SEO TITLE MUST NOT BE IN THE LIST OF SUBTITLE.
    The last subtitle should be the subtitle for the conclusion of the article.
    `,
  };
};

export const editContentPrompt = async (
  article: string,
  subtitleList: string[],
  greatestTitle: string,
  context: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive an article, you will edit it with the requirements that follow.

    - Remove the "Introduction: " from the introduction title.
    - Edit the content of the article to make it easy to read and non-redundant.
    - If acronyms are used, make sure the acronym is written in full the first time it is used, followed by the acronym in parenthesis.
    - If acronyms are used make sure the acronyms is written in capital letters.
    - Make sure to format it in html format.    
    - Here's a list of the subtitle of this article to help you do logical transition between the content: "${subtitleList}" and to help you format the text in html format.
    - You will add this string as title for the article in a h1 tag: "${greatestTitle}".
    - If the article use abbreviations, make sure to write the full word and the abbreviation in parenthesis.
    - THE FIRST <P></P> MUST BE A SHORT INTRODUCTION OF THE ARTICLE. THIS SHOULD BE A MAXIMUM OF 2 SENTENCES.
    - The first <p></p> should not have any <strong></strong>, <em></em>, <a></a> or any other html tags.    - Make sure the mission is not mentioned literally in the test, it should be implicit, only to guide the narration.
    - Make sure that each paragraph is separated by a <p></p> tag.
    - Remove any markup that is not necessary for the article.
    - Make sure the article follow the instructions of the context: "${context}".
    - If bullet point are used in the text, make sure the first word of each bullet point, only the ones before an ":" is in bold.
    - The text output is destined to bring organic traffic to a website.
    - DO NOT MENTION THE WORDS "CALL TO ACTIONS" IN THE TEXT.
    `,
    user: `Edit this article: "${article}".
    Don't forget the call to action at the end of the article.
    Follow all requirements.
    
    - Make sure to format it in html format.
    Highlight the important words in bold.
    Make sure the article is easy to read and non-redundant.
    Make sure there is not bullet point in each section, if there is, reformulate the bullet to change the way it's displayed.
    Make sure paragraph are short and concise and that there are multiple in each section of the article.`,
  };
};

export const createGreatestTitleEverMadePrompt = async ({
  prompt,
  targetAudience,
  mission,
}: {
  prompt: string;
  targetAudience: string;
  mission: string;
}): Promise<{ system: string; user: string }> => {
  //TODO: Use mission simply here
  return {
    system: `Your task is to return a JSON object with 2 field 'id' and 'title'
    Id must a valid, long enough to be unique but still short, SEO id representing the title.
    Title must:
      - Be short, concise and engaging (no more than 8 words).
      - Clearly convey what the article is about without giving away too much.
      - Be highly engaging and draw the reader's attention.
      - Contain keywords that the target audience would use to search for the article.
      - Do NOT mention the target audience directly in the title.
      - Be SEO FRIENDLY.
      - Avoid using colons (:) or any special characters.
      
    Here's our context:
    target audience: "${targetAudience}".
    mission: "${mission}".`,

    user: `Create the best possible 'id' and 'title' for this article "${prompt}".`,
  };
};

export const addInstructionToPromptPrompt = async (
  context: string,
  mission: string,
  targetAudience: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive a small context, the context is too short to be used as a prompt.
    The result should have a maximum of 250 characters.
    Your job will be to develop this context into a list of instruction to create an article from it, 
    with a genuine interest in helping the readers.

    You will be given the mission and the target audience of the article, don't mention them in the prompt, this is only to guide the narrative.

    The output should only be a little more than the prompt given, don't add useless instructions.
    You should only structure the prompt in a way to make a better article out of it.
    You should only guide the construction of the article that will be using the prompt.
    You will only guide the writing of the text, never suggest to add something to it.
    Be concise, the result should not be too long.
    Don't precise each part of the article, you should only mention what the article should take about,
    which subject to details, etc. Don't guide the structure of the article, you should only be giving the big lines of the article.
    Don't mention the beginning, end of article, of any part of the article. You should only improve the prompt by giving a more define subject of the article.

    Output only the revised context, nothing else.`,
    user: `Here is the context you will use to create the instruction for the creation of the article: ${context}.
    The mission is ${mission} and the target audience is ${targetAudience}.

    The result should only be a maximum of 250 characters.
    `,
  };
};
