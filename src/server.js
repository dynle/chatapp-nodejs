import express from "express";
import http from "http";
import SocketIO, { Socket } from "socket.io";
// import WebSocket from "ws";

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
const httpServer = http.createServer(app);
const wsServer = SocketIO(httpServer);

// listen to both http and ws
httpServer.listen(3000, handleListen);

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    // shows which event is fired
    socket.onAny((event) => {
        console.log(`Socket Evnet: ${event}`);
    });
    // set customized event instead of message used in websockets
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done();
        socket.to(roomName).emit("welcome", socket.nickname);
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname)
        );
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });
});

// ------------------------code for websockets------------------------------
/* // create ws server on top of http server
const wss = new WebSocket.Server({ server }); */

// const sockets = [];

// socket is the browser that just connected
/* wss.on("connection", (socket) => {
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
}); */
