import chalk from 'chalk';

const hash = (input, salt = '') => {
    console.log('Hash Input: ', chalk.cyan(input));
    if (typeof input !== 'string') {
        throw new Error(`Can only hash strings!`);
    }

    let hashedOutput = '';

    (input + salt).split('').forEach((char) => {
        const charCode = char.charCodeAt(0);
        const hashedChar = charCode * 3;

        hashedOutput += hashedChar;
    });

    console.log('Hash Output: ', chalk.green(hashedOutput));
    return hashedOutput;
};

export default hash;
