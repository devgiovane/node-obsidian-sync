import fs from "node:fs";
import path from "node:path";
import * as drive from "../services/drive.mjs";

export async function clear() {
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
}

export async function sync(local, folderId) {
    const ignored = [ '.DS_Store', '.obsidian' ];
    const files = fs.readdirSync(local, { withFileTypes: true });
    for (const file of files) {
        const stat = await fs.statSync(`${local}/${file.name}`);
        if (ignored.includes(file.name)) continue;
        if (file.isFile()) {
            let fileChanged = true;
            const exist = await drive.exists(file.name, folderId);
            if (exist) {
                fileChanged = new Date(exist.modifiedTime) < new Date(stat.mtime);
            }
            if (exist && !fileChanged) continue;
            if (exist && fileChanged) {
                await drive.exclude(exist.id);
            }
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
                await sync(`${local}/${file.name}`, exist.id);
                continue;
            }
            const id = await drive.create(folderId, file.name, 'application/vnd.google-apps.folder', null, true);
            await sync(`${local}/${file.name}`, id);
            console.log('Directory uploaded', id);
        }
    }
}
