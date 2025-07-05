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

  const handleReload = () => {
    setNotification(false);
    load('v2');
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

      <hr />
      {RemoteButton ? <RemoteButton /> : <em>loading…</em>}

      {notification && (
        <div style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          backgroundColor: 'white',
          border: '2px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          minWidth: '300px',
          textAlign: 'center'
        }}>
          <h3>Nueva versión disponible</h3>
          <button 
            onClick={handleReload}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            reload
          </button>
        </div>
      )}
    </main>
  );
}
