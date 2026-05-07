import chalk from 'chalk';
import { createClient } from 'redis';

let client: null | ReturnType<typeof createClient> = null;

const startRedis = async () => {
    console.log(chalk.cyan(`Connecting to Redis...`));
    client = createClient();
    client.on('error', err => console.log('Redis Client Error', err));
    await client.connect();
    console.log(chalk.green(`Connected to Redis.`));

    return true;
};

const getRedis = () => {
    if (!client) {
        throw new Error(`Redis is not connected!`);
    }

    return client;
};

export {
    startRedis,
    getRedis,
};

