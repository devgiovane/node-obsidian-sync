import dotenv from 'dotenv';
import * as drive from './services/drive.mjs';

dotenv.config();

try {
    const ignoredFiles = [ 'sync', 'obsidian' ];
    const driveFiles = await drive.list(process.env.GOOGLE_DRIVE_FOLDER_SYNC);
    for (const file of driveFiles) {
        if (ignoredFiles.includes(file.name)) {
            console.log('Ignored', file.id);
            continue;
        }
        console.log('Deleted', file.id);
        await drive.exclude(file.id);
    }
} catch (err) {
    throw err;
}
