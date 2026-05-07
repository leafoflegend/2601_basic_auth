import chalk from 'chalk';
import { db, connectDB } from './db.js';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

const createRandomUser = async () => {
    try {
        await db.query(`
            INSERT INTO users (username, password)
            VALUES ($1, $2);
        `, [faker.string.uuid(), faker.internet.password()]);
    } catch (e) {
        console.log(chalk.red(`Username collision while generating fake data.`));
    }
};

const seed = async () => {
    await connectDB();

    const passwordHash = await bcrypt.hash('password123', 10);

    await db.query(`
        CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    `);
    await db.query(`
        DROP TABLE IF EXISTS users;
    `);
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
             id UUID default uuid_generate_v4(),
             username TEXT UNIQUE NOT NULL,
             password TEXT NOT NULL
        );
    `);
    await db.query(`
        INSERT INTO users (username, password) VALUES ($1, $2);
    `, ['eliot', passwordHash]);

    for (let i = 0; i < 1000000; ++i) {
        await createRandomUser();
    }

    await db.end();
};

seed();
