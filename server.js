const Koa = require('koa');
const Router = require('koa-router');
const cors = require('@koa/cors');
const { faker } = require('@faker-js/faker');

const app = new Koa();
const router = new Router();
const port = 7070;

app.use(cors({
    origin: '*',
    allowMethods: ['GET', 'POST'],
}));

const generateMessages = (count) => {
    const messages = [];
    for (let i = 0; i < count; i++) {
        const message = {
            id: faker.string.uuid(),
            from: faker.internet.email(),
            subject: faker.lorem.sentence(),
            body: faker.lorem.paragraph(),
            received: faker.date.between({ from: new Date(2020, 0, 1), to: new Date(2024, 8, 26) }),
        };
        messages.push(message);
    }
    return messages;
};

router.get('/messages/unread', (ctx) => {
    const unreadMessages = generateMessages(5);
    ctx.body = {
        status: "ok",
        timestamp: Math.floor(Date.now() / 1000),
        messages: unreadMessages,
    };
});

app.use(router.routes()).use(router.allowedMethods());

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
