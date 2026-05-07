import chalk from 'chalk';
import { Client } from 'pg';
import * as bcrypt from 'bcrypt';

let dbIsConnected = false;

const db = new Client(`postgres://eliot:password@localhost:5432/2601_auth`);

const connectDB = async () => {
    if (dbIsConnected) {
        return;
    }

    try {
        console.log(chalk.cyan(`Trying to connect database...`));
        await db.connect();
        console.log(chalk.green(`Database connection successful.`));
        dbIsConnected = true;
    } catch (e) {
        console.log(chalk.red(`Database connection failed.`));
        console.error(e);

        throw e;
    }
};

const createUser = async (username: string, password: string) => {
    const passwordHash = await bcrypt.hash(password, 10);

    const { rows: [{ id: createdId }] } = await db.query(`
        INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id;
    `, [username, passwordHash]);

    return createdId;
};

const loginUser = async (username: string, password: string) => {
    const { rows: [user] } = await db.query(`
        SELECT * FROM users WHERE username = $1;
    `, [username]);

    const matchingPasswords = await bcrypt.compare(password, user.password);

    if (matchingPasswords) {
        return {
            success: true,
            id: user.id,
            username: user.username,
        };
    }

    return {
        success: false,
        id: null,
        username: null,
    };
};

const getUserByUsername = async (username: string) => {
    const { rows: [user] } = await db.query(`
        SELECT username, id FROM users WHERE username = $1 LIMIT 1;
    `, [username]);

    return user;
};

export {
    db,
    connectDB,
    loginUser,
    createUser,
    getUserByUsername,
};
