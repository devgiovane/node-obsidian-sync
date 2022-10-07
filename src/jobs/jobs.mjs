import fs from "node:fs";
import path from "node:path";
//
import { Drive } from "../services/drive.mjs";

export class Jobs {
    #drive = new Drive();
    #filesInDrive = [];

    constructor() {
    }

    async load(q) {
        this.#filesInDrive = await this.#drive.list(q);
    }

    async clean() {
        const ignored = [ 'sync', 'obsidian' ];
        for (const file of this.#filesInDrive) {
            if (ignored.includes(file.name)) {
                console.log(`Ignored id: ${file.id} name: ${file.name}`);
                continue;
            }
            console.log(`Deleted id: ${file.id} name: ${file.name}`);
            await this.#drive.exclude(file.id);
        }
    }

    async sync(local, folderId) {
        const ignored = [ '.DS_Store', '.obsidian' ];
        const filesInLocal = fs.readdirSync(local, { withFileTypes: true });
        for (const file of filesInLocal) {
            console.log(`Verify name: ${file.name}`)
            const stat = await fs.statSync(`${local}/${file.name}`);
            if (ignored.includes(file.name)) {
                console.log(`Ignored name: ${file.name}`);
                continue;
            }
            if (file.isFile()) {
                let fileChanged = true;
                const exist = await this.#drive.exists(file.name, folderId);
                if (exist) {
                    const fileDriveIndex = this.#filesInDrive.findIndex(fileDrive => file.name === fileDrive.name);
                    this.#filesInDrive.splice(fileDriveIndex, 1);
                    fileChanged = new Date(exist.modifiedTime) < new Date(stat.mtime);
                }
                if (exist && !fileChanged) continue;
                if (exist && fileChanged) {
                    await this.#drive.exclude(exist.id);
                }
                const ext = path.extname(file.name);
                if(ext === '.md') {
                    const id = await this.#drive.create(folderId, file.name, 'text/markdown', `${local}/${file.name}`);
                    console.log(`File uploaded id: ${id} name: ${file.name}`);
                    continue;
                }
                if (ext === '.png') {
                    const id = await this.#drive.create(folderId, file.name, 'image/png', `${local}/${file.name}`);
                    console.log(`Image uploaded id: ${id} name: ${file.name}`);
                    continue;
                }
            }
            if (file.isDirectory()) {
                const exist = await this.#drive.exists(file.name, folderId, true);
                if (exist) {
                    const fileDriveIndex = this.#filesInDrive.findIndex(fileDrive => file.name === fileDrive.name);
                    this.#filesInDrive.splice(fileDriveIndex, 1);
                    await this.sync(`${local}/${file.name}`, exist.id);
                    continue;
                }
                const id = await this.#drive.create(folderId, file.name, 'application/vnd.google-apps.folder', null, true);
                await this.sync(`${local}/${file.name}`, id);
                console.log(`Directory uploaded id ${id} name: ${file.name}`);
            }
        }
    }
}
