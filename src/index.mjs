import dotenv from 'dotenv';
import schedule from 'node-schedule';
import * as jobs from './jobs/jobs.mjs';

dotenv.config();

schedule.scheduleJob('30 12 * * *', async function () {
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
    });
    console.log('Sync', formatter.format(new Date()));
    try {
        await jobs.sync(
            process.env.OBSIDIAN_FOLDER_SYNC,
            process.env.GOOGLE_DRIVE_FOLDER_SYNC,
        );
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
});
