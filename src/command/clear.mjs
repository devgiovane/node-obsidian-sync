import dotenv from 'dotenv';
import { Jobs } from '../jobs/jobs.mjs';

dotenv.config();

try {
    const jobs = new Jobs();
    console.time('Clear finished');
    await jobs.load('id, name');
    console.timeLog('Clear finished');
    await jobs.clean();
    console.timeEnd('Clear finished');
    process.exit(0);
} catch (error) {
    console.log(error);
    process.exit(1);
}
