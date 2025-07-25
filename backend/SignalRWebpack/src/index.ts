import * as signalR from "@microsoft/signalr";
import "./css/main.css";

const divMessages: HTMLDivElement = document.querySelector("#divMessages");
const tbMessage: HTMLInputElement = document.querySelector("#tbMessage");
const btnSend: HTMLButtonElement = document.querySelector("#btnSend");
const username = new Date().getTime();

const connection = new signalR.HubConnectionBuilder()
    .withUrl("/hub")
    .build();

connection.on("nuevaVersionRecibida", (modulos: string[]) => {
  const m = document.createElement("div");

  m.innerHTML = `<div class="message-author">Notificación de nueva versión</div><div>${modulos.join(", ")}</div>`;

  divMessages.appendChild(m);
  divMessages.scrollTop = divMessages.scrollHeight;
});

connection.start().catch((err) => document.write(err));

tbMessage.addEventListener("keyup", (e: KeyboardEvent) => {
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
    .then(() => (tbMessage.value = ""));
}