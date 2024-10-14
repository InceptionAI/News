// cronjob.ts
import { onSchedule } from 'firebase-functions/v2/scheduler';
// cronjob.ts
import { dbAdmin } from './lib/firebase-admin';
import { handleNewArticle } from './services/create-article/cronjob-new-article';

/**
 * This function contains the main logic for processing the cron job.
 * It can be called both by a cron job and via an HTTP request.
 */
export const processDailyCronJob = async () => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayTimestamp = today.getTime();

  const cronjobsRef = dbAdmin.collection('cronjobs').doc('nextIdeas');
  const cronjobsDoc = await cronjobsRef.get();

  if (!cronjobsDoc.exists) {
    console.log('No cronjobs found.');
    return;
  }

  const data = cronjobsDoc.data() as Record<
    string,
    {
      date: FirebaseFirestore.Timestamp;
    }
  >;

  if (data) {
    for (const clientId in data) {
      const clientData = data[clientId];
      if (clientData && clientData.date) {
        const date = new Date(clientData.date.toMillis());
        date.setHours(0, 0, 0, 0);
        const dateTimestamp = date.getTime();

        if (dateTimestamp === todayTimestamp) {
          const nextDate = await handleNewArticle(clientId, clientData.date);
          if (nextDate) {
            data[clientId].date = nextDate;
          }
        } else {
          console.log(`Client ${clientId} does not have today's date.`);
        }
      } else {
        console.log(`Client ${clientId} does not have a date field.`);
      }
    }

    await cronjobsRef.set(data);
  }
};

/**
 * Firebase scheduled cron job that runs every day at 8:00 AM.
 */
exports.dailyCronjobs = onSchedule('0 8 * * *', async () => {
  try {
    await processDailyCronJob();
  } catch (error) {
    console.error('Error running daily cron job:', error);
  }
});
