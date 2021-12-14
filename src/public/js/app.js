const socket = io();

const welcome = document.getElementById("welcome");
const room = document.getElementById("room");
const enterForm = welcome.querySelector("#enter");
const nameForm = welcome.querySelector("#name");

room.hidden = true;

let roomName;
let nicknameInput;

function addMessage(message) {
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}

function handleMessageSubmit(event) {
    event.preventDefault();
    const input = room.querySelector("#msg input");
    const value = input.value;
    socket.emit("new_message", input.value, roomName, () => {
        addMessage(`You: ${value}`);
    });
    input.value="";
}

function handleNicknameSubmit(event){
    event.preventDefault();
    nicknameInput = welcome.querySelector("#name input");
    socket.emit("nickname", nicknameInput.value);
}

function handleRoomSubmit(event) {
    event.preventDefault();
    const input = enterForm.querySelector("input");
    // set event called 'room', can send whatever I want to server, func in third argument is fired in backend
    if(nicknameInput!=undefined){
        socket.emit("enter_room", input.value, showRoom);
    }else{
        alert("Please enter a nickname");
    }
    roomName = input.value;
    input.value = "";
}

function showRoom() {
    welcome.hidden = true;
    room.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText = `Room ${roomName}`;
    const msgForm = room.querySelector("#msg");
    msgForm.addEventListener("submit", handleMessageSubmit);
}

nameForm.addEventListener("submit", handleNicknameSubmit);
enterForm.addEventListener("submit", handleRoomSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} joined!`);
});

socket.on("bye", (left) => {
    addMessage(`${left} left!`);
});

socket.on("new_message", addMessage);

// ------------------------code for websockets---------------------------
/* const messageList = document.querySelector("ul");
const nickForm = document.querySelector("#nick");
const messageForm = document.querySelector("#message");
// connection to the server
const socket = new WebSocket(`ws://${window.location.host}`);

// make a JS object into string to prevent the server cannot understand it
function makeMessage(type, payload) {
    const msg = { type, payload };
    return JSON.stringify(msg);
}

socket.addEventListener("open", () => {
    console.log("connected to the server");
});

socket.addEventListener("message", (message) => {
    const li = document.createElement("li");
    li.innerText = message.data;
    messageList.append(li);
});

socket.addEventListener("close", () => {
    console.log("disconnected from the server");
});

function handleSubmit(event) {
    event.preventDefault();
    const input = messageForm.querySelector("input");
    socket.send(makeMessage("new_message",input.value));
    input.value = "";
}

function handleNickSubmit(event) {
    event.preventDefault();
    const input = nickForm.querySelector("input");
    socket.send(makeMessage("nickname",input.value));
    input.value = "";

}

messageForm.addEventListener("submit", handleSubmit);
nickForm.addEventListener("submit", handleNickSubmit); */
