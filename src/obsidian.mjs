import dotenv from 'dotenv';
import * as drive from './services/drive.mjs';

dotenv.config();

try {
    await drive.createFolderIn(
        '1bTr9piVupGm7-MYJON_cyeY6W-R8uHZ-',
        'obsidian',
    )
} catch (err) {
    throw err;
}
