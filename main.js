import express from 'express';
import chalk from 'chalk';
import hash from './hash.js';

const PORT = 3000;
const SALT = process.env.SALT || 'salt_default';

const app = express();

const DB = {};
const loggedInUsers = {};

app.use(express.json());

app.use((req, res, next) => {
    if (req.headers.authorization) {
        const key = req.headers.authorization.slice(7);

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

        res.status(200).send({
            key,
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