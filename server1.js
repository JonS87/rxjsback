const http = require("http");
const Koa = require("koa");
const koaBody = require("koa-body");
const WS = require("ws");

const router = require("./routes");

const app = new Koa();

app.use(
  koaBody({
    urlencoded: true,
  }),
);

app.use(async (ctx, next) => {
  const origin = ctx.request.get("Origin");
  if (!origin) {
    return await next();
  }

  const headers = { "Access-Control-Allow-Origin": "*" };

  if (ctx.request.method !== "OPTIONS") {
    ctx.response.set({ ...headers });
    try {
      return await next();
    } catch (e) {
      e.headers = { ...e.headers, ...headers };
      throw e;
    }
  }

  if (ctx.request.get("Access-Control-Request-Method")) {
    ctx.response.set({
      ...headers,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH",
    });

    if (ctx.request.get("Access-Control-Request-Headers")) {
      ctx.response.set(
        "Access-Control-Allow-Headers",
        ctx.request.get("Access-Control-Request-Headers"),
      );
    }

    ctx.response.status = 204;
  }
});

//TODO: write code here

app.use(router());

const port = process.env.PORT || 7070;
const server = http.createServer(app.callback());

const wsServer = new WS.Server({
  server,
});

const formatDate = (date) => {
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Месяцы начинаются с 0
  const year = date.getFullYear();

  return `${hours}:${minutes} ${day}.${month}.${year}`;
};

let chat = [
  {
    chat: "welcome to our chat",
    nik: "bot",
    time: formatDate(new Date()),
  },
];
let niks = [];

wsServer.on("connection", (ws) => {
  let nik = "";

  ws.on("message", (message) => {
    message = JSON.parse(message);
    console.log(message);

    if (!message.chat) {
      nik = message.nik;
      console.log(niks, niks.includes(nik));
      if (niks.includes(nik)) {
        ws.send(JSON.stringify({ status: "nik exist" }));
      } else {
        niks.push(nik);

        const nikList = JSON.stringify({
          status: "ok",
          niks: niks,
        });

        Array.from(wsServer.clients)
          .filter((client) => client.readyState === WS.OPEN)
          .forEach((client) => client.send(nikList));
      }
    } else {
      chat.push(message);

      const eventData = JSON.stringify(chat);

      Array.from(wsServer.clients)
        .filter((client) => client.readyState === WS.OPEN)
        .forEach((client) => client.send(eventData));
    }
  });

  ws.on("close", () => {
    niks = niks.filter((name) => name !== nik);
    const data = JSON.stringify({ niks: niks });
    console.log(data);
    Array.from(wsServer.clients)
      .filter((client) => client.readyState === WS.OPEN)
      .forEach((client) => client.send(data));
  });

  ws.send(JSON.stringify(chat));
});

server.listen(port);
