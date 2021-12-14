import express from "express";
import http from "http";
import WebSocket from "ws";

const app = express();

app.set("view engine", "pug");
app.set("views", __dirname + "/views");
// Router
app.use("/public", express.static(__dirname + "/public"));
// send GET request to the server
app.get("/", (req, res) => res.render("home"));
app.get("/*", (req, res) => res.redirect("/"));

const handleListen = () => console.log(`Listening on http://localhost:3000`);

// handle http and ws simultaneously, both in the same port
const server = http.createServer(app);
// create ws server on top of http server
const wss = new WebSocket.Server({ server });

const sockets = [];

// socket is the browser that just connected
wss.on("connection", (socket) => {
    sockets.push(socket);
    socket["nickname"] = "Anon";
    console.log("connected to browser");
    socket.on("close", (code, data) => {
        const reason = data.toString();
        console.log("disconnected from the browser");
    });
    socket.on("message", (data, isBinary) => {
        const msg = isBinary ? data : data.toString();
        const message = JSON.parse(msg);

        switch (message.type) {
            case "new_message":
                sockets.forEach((aSocket) => {
                    aSocket.send(`${socket.nickname}: ${message.payload}`);
                });
            case "nickname":
                socket["nickname"] = message.payload;
        }
    });
});

// listen to both http and ws
server.listen(3000, handleListen);
