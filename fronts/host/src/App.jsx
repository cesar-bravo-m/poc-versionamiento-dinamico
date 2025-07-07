import React, { useEffect, useState } from 'react';
import { loadRemoteModule } from './remoteLoader';
import * as signalR from '@microsoft/signalr';


export default function App() {
  const [RemoteButton, setRemoteButton] = useState(null);
  const [RemoteCitas, setRemoteCitas] = useState(null);
  const [active, setActive] = useState('v1');
  const [activeCitas, setActiveCitas] = useState('v1');
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

  const loadCitas = async (ver) => {
    const Module = await loadRemoteModule({
      url: ver === 'v1' ? 'http://localhost:3004/remoteEntry.js' : 'http://localhost:3005/remoteEntry.js',
      scope: ver === 'v1' ? 'remoteCitas_v1' : 'remoteCitas_v2',
      module: ver === 'v1' ? './Button_v1' : './Button_v2'
    });
    setRemoteCitas(() => Module);
  };

  const handleLoadNewVersion = () => {
    setNotification(false);
    load('v2');
    loadCitas('v2');
  };

  const handleStayCurrentVersion = () => {
    setNotification(false);
  };

  useEffect(() => {
    load(active);
    loadCitas(activeCitas);

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub')
      .build()

    connection.on('nuevaVersionRecibida', (modulos) => {
      console.log("### modulos", modulos)
      setNotification(true);
    })
    connection.start().catch(err => console.error(err))
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif' }}>
      <h1>POC Federación Versionada</h1>
      <p>Admisión: <strong>{active}</strong></p>
      <p>Citas: <strong>{activeCitas}</strong></p>

      <hr />
      {RemoteButton ? <RemoteButton /> : <em>loading…</em>}
      {RemoteCitas ? <RemoteCitas /> : <em>loading…</em>}

      <div 
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          backgroundColor: notification ? '#ff4444' : 'lightblue',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'default',
          boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
          zIndex: 1000,
          transition: 'all 0.3s ease',
          border: '2px solid white'
        }}
      >
        {notification && (
          <span style={{
            color: 'white',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            !
          </span>
        )}
        {!notification && (
          <span style={{
            color: 'lightblue',
            fontSize: '24px',
            fontWeight: 'bold'
          }}>
            R
          </span>
        )}
      </div>

      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          right: '20px',
          backgroundColor: 'white',
          border: '2px solid #ccc',
          borderRadius: '8px',
          padding: '20px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          zIndex: 1001,
          minWidth: '250px',
          animation: 'slideIn 0.3s ease'
        }}>
          <h3 style={{ margin: '0 0 15px 0', color: '#333' }}>Nueva versión disponible</h3>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            <button 
              onClick={handleLoadNewVersion}
              style={{
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              Cargar nueva
            </button>
          </div>
        </div>
      )}

      <style>
        {`
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </main>
  );
}
