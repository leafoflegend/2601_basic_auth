import express from 'express';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import { v4 } from 'uuid';
import { createUser, loginUser, getUserByUsername, connectDB } from './db.js';
import { startRedis, getRedis } from './redis.js';

const PORT = 3000;
const SALT = process.env.SALT || 'salt_default';

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use(async (req, res, next) => {
    console.log('Cookies: ', req.cookies);

    let startOfAuthMiddleware = Date.now();
    if (req.cookies.session_key) {
        const sessionKey = req.cookies.session_key as string;

        const redis = getRedis();

        const maybeUser = await redis.get(sessionKey);

        if (maybeUser) {
            req.user = JSON.parse(maybeUser);
        }
    }
    let endOfAuthMiddleware = Date.now();

    let totalTime = endOfAuthMiddleware - startOfAuthMiddleware;

    console.log(chalk.cyan(`Auth Processing Time: `), chalk.magenta(`${totalTime}ms`));

    console.log(chalk.magenta(req.method), chalk.cyan(req.path), req.user ? chalk.red(req.user.username) : '');

    next();
});

app.post('/signup', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        console.log(chalk.cyan(`Sign Up request made with username: ${username}`));
        const userId = await createUser(username, password);
        console.log(chalk.green(`Sign Up request succeeded! Username ${username} granted ID: ${userId}`));

        res.status(201).send({
            message: `User with ID: ${userId} created!`,
        });
    } catch (e) {
        res.status(401).send({
            message: `${username} already exists!`,
        });
    }
});

app.post('/login', async (req, res, next) => {
    const { username, password } = req.body;

    try {
        const loginResults = await loginUser(username, password);

        if (loginResults.success) {
            const sessionKey = v4();

            const redis = getRedis();

            // 60 seconds x 60 minutes x 24 hours
            const DAY_IN_SECONDS = 60 * 60 * 24;

            await redis.set(sessionKey, JSON.stringify({ id: loginResults.id, username: loginResults.username }), {
                expiration: {
                    type: 'EX',
                    value: DAY_IN_SECONDS,
                },
            });

            res.cookie('session_key', sessionKey, {
                expires: new Date(Date.now() + 24 * 3600000),
                sameSite: 'none',
                secure: true,
            });
            res.status(200).send({
                message: `${username} is now logged in!`,
            });
        } else {
            res.status(401).send({
                message: `Invalid username or password.`,
            });
        }
    } catch (e) {
        res.status(500).send({
            message: `Internal server error. Apologies.`,
        });
    }
});

app.get('/me', (req, res, next) => {
    if (!req.user) {
        res.status(401).send({
            message: 'You are not a logged in user!',
        });
    } else {
        res.send({
            user: req.user,
        });
    }
});

const startServer = () => {
    return new Promise((resolve) => {
        app.listen(PORT, () => {
            console.log(chalk.green(`Server is now listening on PORT: ${PORT}`));
            resolve(true);
        })
    });
}

const startApp = async () => {
    await connectDB();
    await startRedis();
    await startServer();

    console.log(chalk.green(`App initialized successfully.`));
}

startApp();
