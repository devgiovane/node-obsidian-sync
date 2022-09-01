import dotenv from 'dotenv';
import * as jobs from '../jobs/jobs.mjs';

dotenv.config();

try {
    await jobs.sync(
        process.env.OBSIDIAN_FOLDER_SYNC,
        process.env.GOOGLE_DRIVE_FOLDER_SYNC,
    );
    process.exit(0);
} catch (err) {
    console.log(err);
    process.exit(1);
}
