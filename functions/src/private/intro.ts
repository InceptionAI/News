export const getIntroPrompt = async (
  intro: string,
  mission: string,
  context: string,
  targetAudience: string,
  subtitle: string[],
): Promise<{ system: string; user: string }> => {
  return {
    system: `Write introduction for the title: "${intro}" and the mission ${mission}", you're a professional on the subject.
      Respect the requirement that follow: "
  
      - Use bullet point to present de rest of the article.
      - Use less then 5 bullet point.
      - Use the list of subtitle to create logical transition in the intro and the rest of the article: ${subtitle}
      - The introduction should be engaging and informative.
      - The introduction must be designed in a way to keep the reader on the site.
      - The content should be designed to hold the reader’s attention and provide valuable information without overwhelming them.
      - The text output is destined to bring organic traffic to the website.
      - It should have a lot of different keywords related to the context.
      - if you have to explain a concept, make it clear and easy to understand.
      - Don't mention the target audience in the text, this is only to guide the narration.
  
      "
      `,
    user: `Create an introduction respecting the requirements for the introduction: "${intro},
      your target audience for this is: "${targetAudience}, 
      Keep in mind that the mission is ${mission} and the context is "${context}".
      Introduction should be short and concise, it should introduce the reader to the article.
      `,
  };
};
