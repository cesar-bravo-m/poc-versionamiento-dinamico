import React, { useEffect, useState } from 'react';
import { loadRemoteModule } from './remoteLoader';
import * as signalR from '@microsoft/signalr';


export default function App() {
  const [RemoteButton, setRemoteButton] = useState(null);
  const [active, setActive] = useState('v1');
  const [notification, setNotification] = useState(false);

  const load = async (ver) => {
    localStorage.setItem('remoteButtonVersion', ver);
    setActive(ver);
    const Module = await loadRemoteModule({
      url: ver === 'v1' ? 'http://localhost:3002/remoteEntry.js' : 'http://localhost:3003/remoteEntry.js',
      scope: ver === 'v1' ? 'remoteButton_v1' : 'remoteButton_v2',
      module: ver === 'v1' ? './Button_v1' : './Button_v2'
    });
    setRemoteButton(() => Module);
  };

  useEffect(() => {
    load(active);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub')
      .build()

    connection.on('messageReceived', (username, message) => {
      setNotification(true);
    })
    connection.start().catch(err => console.error(err))
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif' }}>
      <h1>POC Federación Versionada</h1>
      <p>Versión actual: <strong>{active}</strong></p>
      <p>Notificación: <strong>{notification ? 'true' : 'false'}</strong></p>

      <button onClick={() => load('v1')}>Cargar v1</button>
      <button onClick={() => load('v2')}>Cargar v2</button>

      <hr />
      {RemoteButton ? <RemoteButton /> : <em>loading…</em>}
    </main>
  );
}
