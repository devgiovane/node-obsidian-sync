import fs from 'node:fs';
import { auth } from "./auth.mjs";
import { google } from 'googleapis';

const service = google.drive({ version: 'v3', auth });

export const exists = async function (name, where, isFolder = false) {
    try {
        const res = await service.files.list({
            q: `
                '${where}' in parents and 
                name = '${name}' and 
                trashed = false and 
                mimeType ${isFolder ? '=' : '!=' } 'application/vnd.google-apps.folder'
            `,
            fields: 'files(id, name, modifiedTime)',
            spaces: 'drive',
        });
        if(res.data.files.length) {
            console.log(res.data.files);
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

export const create = async function (where, name, type, path = null, isFolder = false) {
    const fileMetadata = {
        name,
        parents: [ where ],
        mimeType: type
    };
    let params = {
        resource: fileMetadata,
        fields: 'id',
    };
    if (!isFolder) {
        const media = {
            mimeType: type,
            body: fs.createReadStream(path),
        };
        params = { ...params, media };
    }
    try {
        const file = await service.files.create(params);
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
