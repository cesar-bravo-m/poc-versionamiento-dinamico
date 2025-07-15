import React, { useEffect, useState } from 'react';
import { loadRemoteModule } from './remoteLoader';
import * as signalR from '@microsoft/signalr';


export default function App() {
  const [RemoteButton, setRemoteButton] = useState(null);
  const [RemoteCitas, setRemoteCitas] = useState(null);
  const [active, setActive] = useState('');
  const [activeCitas, setActiveCitas] = useState('');
  const [notification, setNotification] = useState(false);
  const [activeTab, setActiveTab] = useState('admision');
  const [versionesRecibidas, setVersionesRecibidas] = useState(null);
  const [dictationText, setDictationText] = useState('');
  const [showDictationModal, setShowDictationModal] = useState(false);

  const load = async (ver) => {
    if (ver === '') {
      setRemoteButton(<em>loading…</em>)
      return;
    }
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
    if (ver === '') {
      setRemoteCitas(<em>loading…</em>)
      return;
    }
    const Module = await loadRemoteModule({
      url: ver === 'v1' ? 'http://localhost:3004/remoteEntry.js' : 'http://localhost:3005/remoteEntry.js',
      scope: ver === 'v1' ? 'remoteCitas_v1' : 'remoteCitas_v2',
      module: ver === 'v1' ? './Button_v1' : './Button_v2'
    });
    setRemoteCitas(() => Module);
  };

  const handleLoadNewVersion = () => {
    setNotification(false);
    load(versionesRecibidas.admision);
    loadCitas(versionesRecibidas.citas);
    setActiveCitas(versionesRecibidas.citas);
  };

  const handleStayCurrentVersion = () => {
    setNotification(false);
  };

  useEffect(() => {
    // Get versions from localhost:5018/versiones
    fetch('http://localhost:5018/versiones/2411')
      .then(response => response.json())
      .then(data => {
        setActive(data.admision);
        setActiveCitas(data.citas);
        load(data.admision);
        loadCitas(data.citas);
      })
      .catch(error => console.error(error));

    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub')
      .build()

    connection.on('nuevaVersionRecibida', (modulos) => {
      console.log("### modulos", modulos)
      // This only notifies us that a new version is available, but we don't know which one
      // We must check the versions again
      fetch('http://localhost:5018/versiones/2411')
        .then(response => response.json())
        .then(data => {
          setNotification(true);
          setVersionesRecibidas(data);
          // setActive(data.admision);
          // setActiveCitas(data.citas);
          // load(data.admision);
          // loadCitas(data.citas);
        })
        .catch(error => console.error(error));
      setNotification(true);
    })

    connection.on('ReceiveDictation', (text) => {
      setDictationText(text);
    })

    connection.start().catch(err => console.error(err))
  }, []);

  const tabStyle = {
    display: 'flex',
    borderBottom: '2px solid #ccc',
    marginBottom: '20px',
    backgroundColor: '#f5f5f5'
  };

  const tabButtonStyle = (isActive) => ({
    flex: 1,
    padding: '12px 20px',
    border: 'none',
    backgroundColor: isActive ? '#007bff' : 'transparent',
    color: isActive ? 'white' : '#007bff',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    borderBottom: isActive ? '2px solid #007bff' : '2px solid transparent',
    transition: 'all 0.3s ease'
  });

  const tabContentStyle = {
    padding: '20px 0'
  };

  const mobileUrl = `http://192.168.0.8:5018/dictation.html`;

  return (
    <main style={{ fontFamily: 'sans-serif' }}>
      <h1>POC Federación Versionada</h1>
      <button onClick={() => setShowDictationModal(true)}>
        Conectar teléfono
      </button>

      <div style={tabStyle}>
        <button
          style={tabButtonStyle(activeTab === 'admision')}
          onClick={() => setActiveTab('admision')}
        >
          Admisión: {active}
        </button>
        <button
          style={tabButtonStyle(activeTab === 'citas')}
          onClick={() => setActiveTab('citas')}
        >
          Citas: {activeCitas}
        </button>
      </div>

      <div style={tabContentStyle}>
        {activeTab === 'admision' && (
          <div>
            {RemoteButton ? <RemoteButton /> : <em>loading…</em>}
          </div>
        )}
        {activeTab === 'citas' && (
          <div>
            {RemoteCitas ? <RemoteCitas /> : <em>loading…</em>}
          </div>
        )}
      </div>

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

      {showDictationModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex',
          alignItems: 'center', justifyContent: 'center', zIndex: 2000
        }}>
          <div style={{ background: 'white', padding: 20, borderRadius: 8, width: '300px' }}>
            <h3>Dictado desde teléfono</h3>
            <p>Abre <a href={mobileUrl} target="_blank" rel="noreferrer">{mobileUrl}</a> en tu teléfono.</p>
            <textarea readOnly value={dictationText} style={{ width: '100%', height: '80px' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10 }}>
              <button onClick={() => navigator.clipboard.writeText(dictationText)}>
                📋 Copiar
              </button>
              <button onClick={() => setShowDictationModal(false)}>Cerrar</button>
            </div>
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
