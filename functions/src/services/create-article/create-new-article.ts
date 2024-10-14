import { createBody } from './create-section/create-subtitle';
import { getListSubtitle } from './create-section/get-list-subtitle';
import { createContentForIntro } from './create-section/create-introduction';
import { createContentForClosure } from './create-section/create-closure';
import { preprocessJSON } from '../preprocessJSON';
import { addArticle } from './add-article';
import { improveBody } from './edit-article/improve-body';
import { editContent } from './edit-article/edit-content';
import { Timestamp } from 'firebase-admin/firestore';
import { Article } from '../../types/article';
import { addSources } from './add-sources/add-souces';
import { createGreatestTitleEverMade } from './create-title/create-greatest-title';
import { createChartDataset } from '../create-chart-dataset.ts/create-dataset';
import { addChartToArticle } from './edit-article/add-chart-to-article';
import { extractLabelAndTitleFromString } from '../util/get-chart-info';
import { addInstructionToPrompt } from '../add-instruction-to-prompt';
import { translate } from '../translate-prompt';
import { improveConclusion } from './edit-article/improve-closure';
import { dbAdmin } from '../../lib/firebase-admin';

export const createNewArticle = async ({
  author,
  clientId,
  domain,
  mission,
  prompt,
  targetAudience,
  CTA = "Let's get started",
  chart = true,
  source = false,
}: {
  author: string;
  clientId: string;
  domain: string;
  mission: string;
  prompt: string;
  targetAudience: string;
  CTA: string;
  chart?: boolean;
  source?: boolean;
}) => {
  //fetch chat gpt api with gpt-4o-mini
  //Étape 1: getListSubtitle, créer une liste de sous-titres
  if (prompt.length < 50) {
    prompt = await addInstructionToPrompt(prompt);
  }
  prompt = await translate(prompt, 'English');

  //TODO: Might be good to use 4o instead of 4o-mini and turn this operation into a more crutial part of the following steps in using the title in combinasion with the prompt
  // Also, we should use this title for the h1 tag in the article
  const { title, id } = await createGreatestTitleEverMade(prompt, targetAudience, mission);

  const docRef = dbAdmin.doc(`${clientId}/en/articles/${id}`);

  if ((await docRef.get()).exists) {
    console.log('Document already exists');
    return;
  }

  //TODO: Later, no added value, shorten id

  const listSubtitle = await getListSubtitle(prompt, targetAudience, mission, title);
  console.log('listSubtitle: ', listSubtitle);
  //Étape 2: First draft, créer le contenu pour chaque sous-titre en parallel
  const listDraft = await Promise.all(
    listSubtitle.map(async (subtitle) => {
      const index = listSubtitle.indexOf(subtitle);

      if (index === 0) {
        return await createContentForIntro(subtitle, mission, prompt, targetAudience, listSubtitle);
      } else if (index === listSubtitle.length - 1) {
        //TODO: Offer availability in closure for the user to add a call to action (MAYBE)
        let conclusion = await createContentForClosure(subtitle, mission, prompt, targetAudience, listSubtitle, CTA, domain);
        return await improveConclusion(subtitle, mission, prompt, targetAudience, listSubtitle, CTA, domain, conclusion);
      } else {
        return await createBody(subtitle, mission, prompt, targetAudience, listSubtitle);
      }
    }),
  );
  //console.log('content: ', content);

  //Étape 3: Final draft, créer le contenu final en faisant des liens dans le contenu (plus tard: aussi en ajoutant des liens internes)
  let body = listDraft.slice(1, -1).join('\n');
  console.log('draft finished');
  body = await improveBody(body, listSubtitle, prompt);
  let content = `${listDraft[0]}\n${body}\n${listDraft[listDraft.length - 1]}`;
  content = await editContent(content, listSubtitle, title, prompt);

  //Add sources if needed
  if (source) {
    content = await addSources(content, mission, prompt, targetAudience);
  }

  content = preprocessJSON(content).replace('html', '');

  //Étape 4: Générer metadata tags (title, description, keywords, ++) et thumbnail pour le contenu final
  // TODO: Do this in parallel, generate metadata
  // const [metadata, chartDataset] = await Promise.all([
  //   generateMetadata(finalContent),
  //   hasChartDataset ? await createChartDataset({ prompt, lang }) : null,
  // ]);

  //const thumbnail = await createNewImage(subject, clientId, id);
  const thumbnail = {
    url: '',
  };

  //Étape x: Améliorer le contenu final de x façons différentes (ex: ajouter des images avec Stock Free Images or AI generated images)
  console.log('draft improved');
  let dataset;

  //TODO: This should be done in parallel
  if (chart) {
    //Add chart if needed
    const description = content.match(/<p(?: id="intro")?>(.+?)<\/p>/)?.[1] ?? '';
    dataset = await createChartDataset(prompt + ' ' + description);
    const chart_info = extractLabelAndTitleFromString(dataset);

    //TODO: Not a priority as of Sep. 02 2024, but this is very very slow and costly for no reason, maybe use the title and prompt to generate the chart or generate the chart in the same step as the content?
    //I don't have a good solution for this yet, but it's a problem
    content = preprocessJSON(await addChartToArticle(content, chart_info)).replaceAll('html', '');
    console.log('chart added');
  }
  const article: Article = {
    href: `https://inceptionai.ca/en-CA/articles/${id}`,
    id,
    title,
    content,
    thumbnail: thumbnail.url,
    author,
    // metadata,
    created: Timestamp.now(),
    published: false,
    dataset: dataset,
    prompt: {
      content: prompt,
    },
  };

  await addArticle(article, clientId, 'en');
  return id;
};
