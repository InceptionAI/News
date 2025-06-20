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
      console.log(`Processing client ${clientId}`);
      const clientData = data[clientId];
      if (clientData && clientData.date) {
        const date = new Date(clientData.date.toMillis());
        date.setHours(0, 0, 0, 0);
        const dateTimestamp = date.getTime();
        console.log(date, today);
        if (dateTimestamp === todayTimestamp) {
          console.log(`Client ${clientId} has a cronjob today.`);
          const nextDate = await handleNewArticle(clientId, clientData.date);
          if (nextDate) {
            data[clientId].date = nextDate;
          }
        } else {
          console.log(`Client ${clientId} does not have a cronjob today.`);
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
exports.dailyCronjobs = onSchedule('0 12 * * *', async () => {
  try {
    await processDailyCronJob();
  } catch (error) {
    console.error('Error running daily cron job:', error);
  }
});
