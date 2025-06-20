export const promptGetRelatedNews = (
    targetAudience: string,
    mission: string,
    prompt: string,
): string => {
    return `
    -You will received a short prompt about a news article that will be generated.
    -Response should be a maximum of 100 characters.
    -Cite the sources of the news afterward.
    -You must return at least 1 valid source to validate the news (Must be cited in APA).
    -Make sure the news is relevant to the subject and to the target audience.
    -You are an expert on the subject.
    -You must return a string in the format: "Related news: [news]", where news in a short and concise news about the subject, to inspire the article that will be generated.
    -The news must be relevant to the subject.
    -The news must be up-to-date.
    -The news must be from reputable sources.
    -The news must be validated before returning it.
    -The news should be interesting and engaging, to inspire the article that will be generated.
    
    The mission of the entrepreneur is: "${mission}"
    The target audience for this article is: "${targetAudience}"
    -The prompt that you will take to generate the news is: "${prompt}"
    `;
};