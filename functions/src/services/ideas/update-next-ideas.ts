import { dbAdmin } from '../../lib/firebase-admin';
import { ClientInfo, FrequencyArticle, NextIdeas, PartialNextIdeas } from '../../types/client-info';
import { Timestamp } from 'firebase-admin/firestore';

/**
 *
 * Here's 3 ways to use this function:
 * 1. Set title to an empty string to delete it from nextIdeas.
 * 2. Set a new object with title = string to add a new idea.
 * 3. Modify an existing idea by setting title = string to another value.
 */

const updateNextIdeas = async (info: ClientInfo, nextIdeasInput: PartialNextIdeas[], merge?: boolean) => {
  const docRef = dbAdmin.doc(`${info.clientId}/info`);
  const frequency = info.frequency ?? 'times-week-3';

  if (!frequency) {
    throw new Error('Posting frequency is not set for the client');
  }

  // Map frequency to times per week
  const frequencyMap: { [key in FrequencyArticle]: number } = {
    'times-week-7': 7,
    'times-week-4': 4,
    'times-week-3': 3,
    'times-week-2': 2,
    'times-week-1': 1,
  };

  const timesPerWeek = frequencyMap[frequency];

  if (!timesPerWeek) {
    throw new Error(`Invalid frequency value: ${frequency}`);
  }

  const intervalDays = 7 / timesPerWeek;
  const intervalMs = intervalDays * 24 * 60 * 60 * 1000;

  const now = new Date();

  // Initialize date to info.startDate or now
  const startDate = info.startDate ? info.startDate.toDate() : now;
  let date = startDate;

  const updatedNextIdeas: NextIdeas[] = [];

  for (let i = 0; i < nextIdeasInput.length; i++) {
    const idea = nextIdeasInput[i];
    const updatedIdea: PartialNextIdeas = { ...idea };

    // Validate title
    if (typeof idea.title !== 'string' || !idea.title.trim()) {
      console.warn(`Skipping idea at position ${i + 1} due to invalid or empty title.`);
      continue; // Skip adding this idea to updatedNextIdeas
    }
    updatedIdea.title = idea.title.trim();

    // Handle date
    if (idea.date) {
      // Check if date is a string, convert to Timestamp
      if (typeof idea.date === 'string') {
        idea.date = Timestamp.fromDate(new Date(idea.date));
        updatedIdea.date = idea.date;
      }
      const ideaDate = idea.date.toDate();

      const diffDays = (now.getTime() - ideaDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays > 3 && updatedIdea.new) {
        delete updatedIdea.new;
      }
      date = ideaDate;
    } else {
      // Assign a date based on info.startDate or previous idea's date plus interval
      if (i === 0) {
        // Use info.startDate for the first idea if available
        if (info.startDate) {
          date = info.startDate.toDate();
        } else if (date < now) {
          // Ensure first date is not in the past
          date = now;
        }
      } else if (updatedNextIdeas[i - 1].date) {
        // For subsequent ideas, increment date by interval
        date = new Date(updatedNextIdeas[i - 1].date!.toDate().getTime() + intervalMs);
      }

      updatedIdea.date = Timestamp.fromDate(date);
      updatedIdea.new = true;
    }

    // Ensure date field is always a Timestamp
    if (!updatedIdea.date) {
      updatedIdea.date = Timestamp.fromDate(date);
    }

    // Update date for next iteration
    date = new Date(date.getTime() + intervalMs);

    updatedNextIdeas.push(updatedIdea as NextIdeas);
  }

  if (merge) {
    return updatedNextIdeas;
  }

  // Update Firestore document
  await docRef.update({
    nextIdeas: updatedNextIdeas,
  });
  return updatedNextIdeas;
};

export { updateNextIdeas };
