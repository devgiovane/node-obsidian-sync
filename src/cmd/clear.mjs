import dotenv from 'dotenv';
import * as drive from "../services/drive.mjs";

dotenv.config();

try {
    const ignored = [ 'sync', 'obsidian' ];
    const files = await drive.list(process.env.GOOGLE_DRIVE_FOLDER_SYNC);
    for (const file of files) {
        if (ignored.includes(file.name)) {
            console.log('Ignored', file.id);
            continue;
        }
        console.log('Deleted', file.id);
        await drive.exclude(file.id);
    }
    process.exit(0);
} catch (err) {
    console.log(err);
    process.exit(1);
}
