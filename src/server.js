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

// socket is the browser that just connected
wss.on("connection", (socket) => {
    console.log("connected to browser");
    socket.on('close', function close(code, data) {
        const reason = data.toString();
        console.log("disconnected from the browser");
    });

    socket.on('message', function message(data, isBinary) {
        const message = isBinary ? data : data.toString();
        console.log("Just got this: ",message," from the browser");
    });

    socket.send("hello!!");
});

// listen to both http and ws
server.listen(3000, handleListen);
