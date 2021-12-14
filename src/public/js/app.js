// connection to the server
const socket = new WebSocket(`ws://${window.location.host}`);

socket.addEventListener("open", () => {
    console.log("connected to the server");
});

socket.addEventListener("message", (message) => {
    console.log("Just got this: ", message.data," from the server");
});

socket.addEventListener("close",()=>{
    console.log("disconnected from the server");
})

setTimeout(()=>{
    socket.send("hello from the broswer!");
},3000);