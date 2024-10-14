import moduleAlias from 'module-alias';
moduleAlias.addAliases({
  '@': `${__dirname}`,
});

import * as functions from 'firebase-functions';
import app from './app';
import { onSchedule } from 'firebase-functions/v2/scheduler';
import { processDailyCronJob } from './cronjobs';

const runtimeOpts = {
  timeoutSeconds: 540,
  memory: '1GB' as const,
};

exports.app = functions.runWith(runtimeOpts).https.onRequest(app);

exports.dailyCronjobs = onSchedule('0 8 * * *', async () => {
  try {
    await processDailyCronJob();
  } catch (error) {
    console.error('Error running daily cron job:', error);
  }
});
