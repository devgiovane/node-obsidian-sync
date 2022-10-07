import dotenv from 'dotenv';
import schedule from 'node-schedule';
//
import { Jobs } from "./jobs/jobs.mjs";

dotenv.config();

schedule.scheduleJob('30 12 * * *', async function () {
    const jobs = new Jobs()
    const formatter = new Intl.DateTimeFormat('pt-BR', {
        hour: 'numeric', minute: 'numeric', second: 'numeric',
    });
    console.log('Sync', formatter.format(new Date()));
    try {
        await jobs.load('id, name')
        await jobs.sync(
            process.env.OBSIDIAN_FOLDER_SYNC,
            process.env.GOOGLE_DRIVE_FOLDER_SYNC,
        );
        await jobs.clean();
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
});
