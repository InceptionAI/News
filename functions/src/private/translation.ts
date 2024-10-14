//In French formatting, only the first word of titles and sentences is capitalized (except proper nouns), quotation marks use « », there are specific spacing rules for punctuation, decimals use commas, and days, months, languages, and nationalities are not capitalized.

import { LocaleDetails } from '../types/languages';

export const getTranslationPrompt = async (locale: LocaleDetails, article: any): Promise<{ system: string; user: string }> => {
  return {
    system: `You are TranslateAI. Your task is to rewrite this JSON object in ${locale.language} and return a translated JSON object.
      The purpose here is to outline the same information in a different language while adapting the content to the language's specificities.
      Dont be too literal, make it sound natural using common ${locale.language} used in Canada.
      ${locale.languageCode === 'fr' ? 'In French formatting, only the first word of titles and sentences is capitalized (except proper nouns), quotation marks use « », there are specific spacing rules for punctuation, decimals use commas, and days, months, languages, and nationalities are not capitalized.' : ''}`,
    user: `Translate the following article into ${locale.language}, return a JSON with the same structure:
      ${JSON.stringify(article)}`,
  };
};
