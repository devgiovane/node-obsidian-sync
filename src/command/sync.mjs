import dotenv from 'dotenv';
import { Jobs } from '../jobs/jobs.mjs';

dotenv.config();

try {
    const jobs = new Jobs();
    console.time('Sync finished');
    await jobs.load('id, name');
    console.timeLog('Sync finished');
    await jobs.sync(
        process.env.OBSIDIAN_FOLDER_SYNC,
        process.env.GOOGLE_DRIVE_FOLDER_SYNC,
    );
    console.timeLog('Sync finished');
    await jobs.clean();
    console.timeEnd('Sync finished');
    process.exit(0);
} catch (error) {
    console.log(error);
    process.exit(1);
}
