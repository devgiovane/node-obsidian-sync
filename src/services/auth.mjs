import path from "node:path";
import { __dirname } from '../dirname.mjs';
import { GoogleAuth } from 'google-auth-library';

export class Authentication {
    #options = {
        keyFile: path.resolve(__dirname, '../', 'key.json'),
        scopes: [ 'https://www.googleapis.com/auth/drive' ]
    }

    constructor() {
    }

    create() {
        return new GoogleAuth(this.#options);
    }
}
