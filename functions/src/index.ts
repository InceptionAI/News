import moduleAlias from 'module-alias';
moduleAlias.addAliases({
  '@': `${__dirname}`,
});

import app from './app';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { onRequest } from 'firebase-functions/v2/https';
import { processDailyCronJob } from './cronjobs';

// 2nd Gen HTTP Function
export const appFunction = onRequest(
  {
    timeoutSeconds: 540,
    memory: '1GiB',
    maxInstances: 10,
    region: 'us-central1',
  },
  app
);

// 2nd Gen Scheduled Function
export const dailyCronjobs = onSchedule(
  {
    schedule: '0 8 * * *',
    timeZone: 'UTC',
    region: 'us-central1',
    memory: '1GiB',
    maxInstances: 1,
  },
  async () => {
    try {
      await processDailyCronJob();
    } catch (error) {
      console.error('Error running daily cron job:', error);
      throw error;
    }
  }
);
