export const findSourcesItemPrompt = async (
  article: string,
  mission: string,
  subject: string,
  targetAudience: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive an article, you find 3 key element of the article.
      You must return an array of string containing the key element.
  
      You will take 3 important elements of the article that a source could be added and ALSO be relevant.
      Keep in mind that these element must be relevant to the content.
      You will received the article, the mission and the subject.
      You will return a list of 3 key element of the article that a source could be added and ALSO be relevant.
  
      `,
    user: `You must return an array of string containing the key element. Here's the article: "${article}", the mission: "${mission}", the subject of the article: "${subject}".
      Find 3 key element of the article that a source could be added and ALSO be relevant. 
      Your target audience for this is: "${targetAudience}`,
  };
};

export const addSourcesToItemPrompt = async (
  keyElement: string,
  subject: string,
  targetAudience: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive an array of key element.
      You must find the 3 most important element of the article for this subject: "${subject}"
      Scrape the web to find 3 relevant sources for each of these elements.
      YOU WILL ONLY RETURN THE URL OF THE SOURCES.
      URL should be in the format: "www.example.com".
      Sources must be relevant to the content.
      Sources must be from reputable sources.
      Sources must be up-to-date.
      THE SOURCES MUST BE VALIDATED BEFORE RETURNING THEM.
      IMPORTANT: YOU MUST FIND ARTICLE RELATED TO THE SUBJECT AS SOURCES FOR AN ARTICLE.
      THE SOURCES MUST BE ARTICLE OR BLOGS. YOU SHOULD NOT RETURN HOMEPAGE, BUT LINK TO THE ARTICLE OR BLOG.
  
  
      You will find a relevant sources to EACH of the elements.
      You will return the sources in APA format.
      You must validate the sources before adding them to the article.
      You must verify if the link is still up-to-date.
      You must verify if the link redirect to the right page.
      The sources added should be relevant and add value to the article.
  
      The requirement are:
      -Add a maximum of 3 useful sources to the article.
      -The sources must be from academic sources.
      -The sources must be in APA format.
      -The sources must be relevant to the content.
      -The sources must be from reputable sources.
      -The sources must be up-to-date.
      -The sources must be cited correctly.
      -The sources must be added in the right place in the article.
  
      Keep in mind that these element must be relevant to the content.
  
      `,
    user: `Here's the array of key element: "${keyElement}". Find a relevant sources to each of these elements. 
      ${targetAudience ? `Your target audience for this is: "${targetAudience}"` : ''}`,
  };
};

export const parseUrlPrompt = async (sources: string): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive a list of sources.
      You will parse the sources to extract the domain name of the source.
      You will return the domain name of the source in a JSON format.
  
      Example: {
        "source1": "domain1",
        "source2": "domain2",
        "source3": "domain3",
      }
  
      `,
    user: `Parse the sources to extract the domain name of the source: "${sources}"`,
  };
};

export const addSourcesPrompt = async (
  article: string,
  sources: string[],
  listKeyElement: string,
  targetAudience: string,
): Promise<{ system: string; user: string }> => {
  return {
    system: `You will receive an article, sources for the article and the key element associate to these sources.
      IMPORTANT: YOU NEED TO DELETE ALL HTML TAGS OF <A></A> OR ANY OTHER LINK TAGS. ADD THE SOURCE SHOULD BE IN APA FORMAT.
      You must link the sources to the key element in the article.
      You must put the sources at the right place, associate to the right key element. 
      You must add the sources to the article using APA format.
      IMPORTANT: YOU NEED TO RETURN ALL THE CONTENT OF THE ARTICLE GIVEN TO YOU.
      You will delete all link html tag already present in the article.
      Return all the article with the sources added in APA format and via html link tag.
  
      You will add the sources to the article in APA format AND via html link tag at the correct location.
      You will also remove all other html link from the article you are given.
      The sources must be implemented via html link.
      You must validate the sources before adding them to the article.
      You must verify if the link is still up-to-date.
      You must verify if the link redirect to the right page.
      The sources added should be relevant and add value to the article.
      You will remove all other html link that was there before this prompt.
  
      `,
    user: `Add sources to this article: "${article}.
      Here's the list of sources to add to this article: ${sources}" Here's the list of key element: ${listKeyElement}.
      You will return all the article with the sources added to it.
      Your target audience for this is: "${targetAudience}
      IMPORTANT: YOU NEED TO DELETE ALL HTML TAGS OF <A></A> OR ANY OTHER LINK TAGS. ADD THE SOURCE SHOULD BE IN APA FORMAT. `,
  };
};
