import fs from 'node:fs';
import { google } from 'googleapis';
//
import { Authentication } from "./auth.mjs";

export class Drive {
    #auth = new Authentication();
    #service = google.drive({ version: 'v3', auth: this.#auth.create() })

    constructor() {
    }

    async list(q) {
        try {
            const res = await this.#service.files.list({
                fields: `files(${q})`,
                spaces: 'drive'
            });
            return res.data.files;
        } catch (err) {
            throw err;
        }
    }

    async exists(name, where, isFolder = false) {
        try {
            const res = await this.#service.files.list({
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
                const [ file ] = res.data.files;
                return file;
            }
            return null;
        } catch (err) {
            throw err;
        }
    }

    async create(where, name, type, path = null, isFolder = false) {
        const fileMetadata = {
            name, parents: [ where ], mimeType: type
        };
        let params = {
            resource: fileMetadata, fields: 'id',
        };
        if (!isFolder) {
            const media = {
                mimeType: type,
                body: fs.createReadStream(path),
            };
            params = { ...params, media };
        }
        try {
            const file = await this.#service.files.create(params);
            return file.data.id;
        } catch (err) {
            throw err;
        }
    }

    async exclude(id) {
        try {
            await this.#service.files.delete({
                fileId: id,
                fields: 'id'
            });
        } catch (err) {
            throw err;
        }
    }
}
