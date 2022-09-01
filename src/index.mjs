import fs from "node:fs";
import path from "node:path";
import dotenv from 'dotenv';
import * as drive from './services/drive.mjs';

dotenv.config();

async function syncObsidian(local, folderId, folderName) {
    const ignoredFiles = [ '.DS_Store', '.obsidian' ];
    const obsidianFiles = fs.readdirSync(local, { withFileTypes: true });
    for (const file of obsidianFiles) {
        if (ignoredFiles.includes(file.name)) {
            continue;
        }
        if (file.isFile()) {
            const ext = path.extname(file.name);
            const exist = await drive.exists(file.name);
            if (exist) continue;
            if(ext === '.md') {
                const id = await drive.createFileIn(
                    folderId,
                    file.name,
                    'text/markdown',
                    `${local}/${file.name}`
                );
                console.log('File uploaded', id)
            }
            if (ext === '.png') {
                const id = await drive.createFileIn(
                    folderId,
                    file.name,
                    'image/png',
                    `${local}/${file.name}`
                );
                console.log('File uploaded', id)
            }
        }
        if (file.isDirectory()) {
            const exist = await drive.folderExists(file.name, folderName);
            if (exist) {
                await syncObsidian(
                    `${local}/${file.name}`,
                    exist.id,
                    file.name
                );
            }
            const id = await drive.createFolderIn(
                folderId,
                file.name
            );
            console.log('Directory uploaded', id);
            await syncObsidian(
                `${local}/${file.name}`,
                id,
                file.name
            );
        }
    }
}

try {
    await syncObsidian(
        process.env.GOOGLE_DRIVE_THIS_FOLDER_SYNC,
        process.env.GOOGLE_DRIVE_FOLDER_SYNC,
        'obsidian'
    );
} catch (err) {
    console.log(err);
    throw err;
}
