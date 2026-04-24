import express from 'express';
import chalk from 'chalk';
import cookieParser from 'cookie-parser';
import hash from './hash.js';

const PORT = 3000;
const SALT = process.env.SALT || 'salt_default';

const app = express();

interface FakeDatabase {
    [username: string]: string;
}
const DB: FakeDatabase = {};

interface LoggedInUsers {
    [userKey: string]: string;
}
const loggedInUsers: LoggedInUsers = {};

app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Cookies: ', req.cookies);

    if (req.cookies.user_key) {
        const key = req.cookies.user_key as string;

        if (loggedInUsers[key]) {
            req.user = loggedInUsers[key];
        }
    }

    console.log(chalk.magenta(req.method), chalk.cyan(req.path), req.user ? chalk.red(req.user) : '');

    next();
});

app.post('/signup', (req, res, next) => {
    const { username, password } = req.body;

    if (!DB[username]) {
        DB[username] = hash(password, SALT);

        res.status(201).send({
            message: `${username} created!`,
        });
    } else {
        res.status(401).send({
            message: `${username} already exists!`,
        });
    }
});

app.post('/login', (req, res, next) => {
    const { username, password } = req.body;

    if (DB[username] && DB[username] === hash(password, SALT)) {
        const key = Math.random() * 1000000;
        // User Session
        loggedInUsers[key] = username;

        res.cookie('user_key', key, {
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

app.listen(PORT, () => {
    console.log(chalk.green(`Server is now listening on PORT: ${PORT}`));
})