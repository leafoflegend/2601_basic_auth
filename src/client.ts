const USERNAME = 'eliotpszw';
const PASSWORD = 'password123!';

const BASE_URL = 'http://localhost:3000';

const signupUser = async () => {
    const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: USERNAME,
            password: PASSWORD,
        }),
    });

    const jsonResponse = await response.json();

    console.log('Signup Response: ', jsonResponse);
};

const loginUser = async () => {
    const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: USERNAME,
            password: PASSWORD,
        }),
    });

    const jsonResponse = await response.json();

    console.log('Login Response: ', jsonResponse);
};

const getMyData = async () => {
    const response = await fetch(`${BASE_URL}/me`, {
        credentials: 'include',
    });
    const jsonResponse = await response.json();

    console.log('My Data: ', jsonResponse);
};

const runRequests = async () => {
    try {
        await signupUser();
    } catch (e) {}
    await loginUser();
    await getMyData();
};

runRequests();
