import fs from "node:fs";
import path from "node:path";
import dotenv from 'dotenv';
import * as drive from '../services/drive.mjs';

dotenv.config();

async function syncObsidian(local, folderId) {
    const ignored = [ '.DS_Store', '.obsidian' ];
    const files = fs.readdirSync(local, { withFileTypes: true });
    for (const file of files) {
        if (ignored.includes(file.name)) continue;
        if (file.isFile()) {
            const exist = await drive.exists(file.name, folderId);
            if (exist) continue;
            const ext = path.extname(file.name);
            if(ext === '.md') {
                const id = await drive.create(folderId, file.name, 'text/markdown', `${local}/${file.name}`);
                console.log('File uploaded', id);
                continue;
            }
            if (ext === '.png') {
                const id = await drive.create(folderId, file.name, 'image/png', `${local}/${file.name}`);
                console.log('Image uploaded', id);
                continue;
            }
        }
        if (file.isDirectory()) {
            const exist = await drive.exists(file.name, folderId, true);
            if (exist) {
                await syncObsidian(`${local}/${file.name}`, exist.id);
                continue;
            }
            const id = await drive.create(folderId, file.name, 'application/vnd.google-apps.folder', null, true);
            await syncObsidian(`${local}/${file.name}`, id);
            console.log('Directory uploaded', id);
        }
    }
}

try {
    await syncObsidian(
        process.env.OBSIDIAN_FOLDER_SYNC,
        process.env.GOOGLE_DRIVE_FOLDER_SYNC,
    );
    process.exit(0);
} catch (err) {
    console.log(err);
    process.exit(1);
}
