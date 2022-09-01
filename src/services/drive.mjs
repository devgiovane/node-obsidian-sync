import fs from 'node:fs';
import { auth } from "./auth.mjs";
import { google } from 'googleapis';

const service = google.drive({ version: 'v3', auth });

export const exists = async function (name) {
    try {
        const res = await service.files.list({
            q: `name='${name}' and trashed = false`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        if(res.data.files.length) {
            const [ file ] = res.data.files;
            return file;
        }
        return null;
    } catch (err) {
        throw err;
    }
}

export const folderExists = async function (name) {
    try {
        const res = await service.files.list({
            q: `name='${name}' and trashed = false and mimeType='application/vnd.google-apps.folder'`,
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        if(res.data.files.length) {
            const [ file ] = res.data.files;
            return file;
        }
        return null;
    } catch (err) {
        throw err;
    }
}

export const list = async function () {
    try {
        const res = await service.files.list({
            fields: 'files(id, name)',
            spaces: 'drive',
        });
        return res.data.files;
    } catch (err) {
        throw err;
    }
}

export const createFileIn = async function (folder, name, type, path) {
    const fileMetadata = {
        name,
        parents: [ folder ],
        mimeType: type
    };
    const media = {
        mimeType: 'image/jpeg',
        body: fs.createReadStream(path),
    };
    try {
        const file = await service.files.create({
            resource: fileMetadata,
            media,
            fields: 'id',
        });
        return file.data.id;
    } catch (err) {
        throw err;
    }
}

export const createFolderIn = async function (folder, name) {
    const fileMetadata = {
        name,
        parents: [ folder ],
        mimeType: 'application/vnd.google-apps.folder'
    };
    try {
        const file = await service.files.create({
            resource: fileMetadata,
            fields: 'id',
        });
        return file.data.id;
    } catch (err) {
        throw err;
    }
}

export const exclude = async function (id) {
    try {
        await service.files.delete({
            fileId: id,
            fields: 'id'
        });
    } catch (err) {
        throw err;
    }
}
