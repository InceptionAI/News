// import { dbAdmin } from '../../lib/firebase-admin';
import { ClientInfo, NextIdeas } from '../../types/client-info';
import { get100Ideas } from './get-100-ideas';
import { updateNextIdeas } from './update-next-ideas';

// This function is called by the cronjob to remove first element of nextIdeas and add a new one
export const handleNewNextIdeas = async (info: ClientInfo, mission: string, targetAudience: string, docRef: any) => {
  console.log('Updating next ideas');
  // console.log('Client info:', info);
  // const docRef = dbAdmin.doc(`${info.clientId}/info`);
  // const docSnap = await docRef.get();
  // const data = docSnap.data();

  const data = info;

  // console.log('Client info:', data);

  if (!data) {
    console.log('Client info does not exist');
    return;
  }

  let nextIdeas = data.nextIdeas as any[];
  let ideas = data.ideas as string[];

  if (!nextIdeas || !ideas) {
    console.log('No next ideas or ideas found');
    return;
  }

  // Step 1: Order the elements by date before updating
  nextIdeas.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());

  // Step 2: Remove the first element (after sorting)
  nextIdeas.shift();

  // console.log('Next ideas after removing first element:', nextIdeas);

  // If there are less than 7 ideas, get a new one
  while (nextIdeas.length < 7) {
    // Step 3: Get a new idea
    const randomIndex = Math.floor(Math.random() * ideas.length);
    const newNextIdeaTitle = ideas[randomIndex];

    // Remove the idea from the ideas list
    ideas.splice(randomIndex, 1);

    // If there are no ideas left, get 100 new ideas
    if (ideas.length === 0) {
      console.log('No ideas left, getting 100 new ideas');
      ideas = await get100Ideas(mission, targetAudience);
    }

    // Add the new idea to nextIdeas
    nextIdeas.push({ title: newNextIdeaTitle });
  }
  // console.log('Next ideas updated:', nextIdeas);

  // Update the ideas array in Firestore
  await docRef.update({ ideas });

  // Step 4: Use updateNextIdeas to update dates and save to Firestore
  await updateNextIdeas(info, nextIdeas, docRef);
  // console.log('Next ideas updated');

  // Step 5: Return the date of the closest next idea
  const updatedDocSnap = await docRef.get();
  const updatedData = updatedDocSnap.data();
  const updatedNextIdeas = updatedData?.nextIdeas as NextIdeas[];

  // Ensure the updated nextIdeas are sorted by date
  updatedNextIdeas.sort((a, b) => a.date.toDate().getTime() - b.date.toDate().getTime());
  // console.log('Updated next ideas:', updatedNextIdeas);
  const closestNextIdea = updatedNextIdeas[0];
  // console.log('Closest next idea:', closestNextIdea);

  // Return the date of the closest next idea
  return closestNextIdea.date;
};
