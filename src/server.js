import express from "express";
import http from "http";
import { Server } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
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
const wsServer = new Server(httpServer, {
    cors: {
        origin: ["https://admin.socket.io"],
        credentials: true,
    },
});

// for admin-ui, https://admin.socket.io
instrument(wsServer, {
    auth: false,
});

function publicRooms() {
    const {
        sockets: {
            adapter: { sids, rooms },
        },
    } = wsServer;
    const publicRooms = [];
    rooms.forEach((_, key) => {
        if (sids.get(key) === undefined) {
            publicRooms.push(key);
        }
    });
    return publicRooms;
}

function countRoom(roomName) {
    return wsServer.sockets.adapter.rooms.get(roomName)?.size;
}

wsServer.on("connection", (socket) => {
    socket["nickname"] = "Anon";
    wsServer.sockets.emit("room_change", publicRooms());
    // shows which event is fired
    socket.onAny((event) => {
        console.log(`Socket Evnet: ${event}`);
    });
    // set customized event instead of message used in websockets
    socket.on("enter_room", (roomName, done) => {
        socket.join(roomName);
        done(countRoom(roomName));
        socket
            .to(roomName)
            .emit("welcome", socket.nickname, countRoom(roomName));
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("exit_room", (roomName,done) => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
        socket.leave(roomName);
        wsServer.sockets.emit("room_change", publicRooms());
        done();
    });
    socket.on("disconnecting", () => {
        socket.rooms.forEach((room) =>
            socket.to(room).emit("bye", socket.nickname, countRoom(room) - 1)
        );
    });
    // just before disconnected
    socket.on("disconnect", () => {
        wsServer.sockets.emit("room_change", publicRooms());
    });
    socket.on("new_message", (msg, room, done) => {
        socket.to(room).emit("new_message", `${socket.nickname}: ${msg}`);
        done();
    });
    socket.on("nickname", (nickname) => {
        socket["nickname"] = nickname;
    });
});

// listen to both http and ws
httpServer.listen(process.env.PORT || 3000, handleListen);

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
