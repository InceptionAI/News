export const getConclusionPrompt = async (
  closure: string,
  mission: string,
  context: string,
  targetAudience: string,
  subtitle: string[],
  CTA: string,
  domain: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `Create conclusion with all the information you will be given, you're a professional on this context.
      You will receive the subtitle of the conclusion, the mission, the context and the target audience.
      You will respect the requirement that follow:
      "
  
      - Don't mention the call to action in the title.
      - It should have an interesting and engaging title.
      - Make sure the conclusion is related to the mission.
      - The conclusion title should be pertinent to the article.
      - Make sure the conclusion title is interesting and engaging.
      - The conclusion subtitle should begin with "Conclusion: ".
      - You will also receive a list of subtitles of this article to help you create a logical conclusion with the rest of the article.
      - The text output is destined to bring organic traffic to a website.
      - Summarize the key points and encourage the reader to take action, about the CTA (call to action): "${CTA}".
      - Use the call to action in a intuitive way.
      - Make sure the conclusion is related to the mission of the article: "${mission}".
      - Link the domain of the client for further information: "${domain}", use a link html tag to the website, don't mention the url in the text, use by example "click here for further information". 
      - Make the link in the conclusion in a way that the reader will want to click on it. 
      - Make it concise and informative.
      - If you have to explain a concept, make it clear and easy to understand
      - The call to action should be related to the mission.
      - The Call to Action (CTA) must be in a different paragraph, at last.
      - Don't use word for word the information given to you.
      - Don't mention the target audience in the text, this is only to guide the narration.
      - Put the conclusion as a title in the closure.
      "
      `,
    user: `Create a conclusion respecting the requirements for the conclusion: "${closure},
      your target audience is: "${targetAudience}:,
      the mission is: "${mission}" and the context is "${context}".
      Here's a list of the subtitle of this article to help you do logical transition between the content: ${subtitle}.
      `,
  };
};

export const improveConclusionPrompt = async (
  closure: string,
  mission: string,
  prompt: string,
  targetAudience: string,
  subtitle: string[],
  CTA: string,
  domain: string,
  conclusion: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `Edit the given conclusion to make sure it respect these requirements: 
      "
      - The conclusion title should be pertinent to the article.
      - Summarize the key points and encourage the reader to take action, about the CTA (call to action): "${CTA}".
      - Use the call to action in a intuitive way.
      - Make sure the conclusion is related to the mission of the article: "${mission}".
      - Link the domain of the client for further information: "${domain}", use a link html tag to the website, don't mention the url in the text, use by example "click here for further information". 
      - Make the link in the conclusion in a way that the reader will want to click on it. 
      - The call to action should be related to the mission.
      - The Call to Action (CTA) must be in a different paragraph, at last.
      - Don't use word for word the information given to you.
      - Don't mention the target audience in the text, this is only to guide the narration.
      "
      `,
    user: `Create a conclusion respecting the requirements for the conclusion: "${closure},
      your target audience is: "${targetAudience}:,
      the mission is: "${mission}" and the context is "${prompt}".
      Here's the conclusion you will improve: "${conclusion}".
      Here's a list of the subtitle of this article to help you do logical transition between the content: ${subtitle}.
      `,
  };
};
