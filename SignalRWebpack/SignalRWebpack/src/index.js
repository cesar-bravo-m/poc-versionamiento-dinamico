"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var signalR = require("@microsoft/signalr");
require("./css/main.css");
var divMessages = document.querySelector("#divMessages");
var tbMessage = document.querySelector("#tbMessage");
var btnSend = document.querySelector("#btnSend");
var username = new Date().getTime();
var connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();
// connection.on("messageReceived", (username: string, message: string) => {
//   const m = document.createElement("div");
// 
//   m.innerHTML = `<div class="message-author">${username}</div><div>${message}</div>`;
// 
//   divMessages.appendChild(m);
//   divMessages.scrollTop = divMessages.scrollHeight;
// });
connection.on("nuevaVersionRecibida", function (modulos) {
    var m = document.createElement("div");
    m.innerHTML = "<div class=\"message-author\">Notificaci\u00F3n de nueva versi\u00F3n</div><div>".concat(modulos.join(", "), "</div>");
    divMessages.appendChild(m);
    divMessages.scrollTop = divMessages.scrollHeight;
});
connection.start().catch(function (err) { return document.write(err); });
tbMessage.addEventListener("keyup", function (e) {
    if (e.key === "Enter") {
        send();
    }
});
btnSend.addEventListener("click", send);
function send() {
    // connection.send("newMessage", username, tbMessage.value)
    //   .then(() => (tbMessage.value = ""));
    // connection.send("nuevoMensaje", tbMessage.value)
    //   .then(() => (tbMessage.value = ""));
    connection.send("notificarNuevaVersion", tbMessage.value)
        .then(function () { return (tbMessage.value = ""); });
}
