import dotenv from 'dotenv';
import schedule from 'node-schedule';
import * as jobs from './jobs/jobs.mjs';

dotenv.config();

schedule.scheduleJob('30 12 * * *', async function () {
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
