import React, { useEffect, useState } from 'react';
import { loadRemoteModule } from './remoteLoader';
import { getActiveRemoteUrl } from './versionService';

export default function App() {
  const [RemoteButton, setRemoteButton] = useState(null);
  const [active, setActive] = useState('v1');

  const load = async (ver) => {
    console.log("### cargar ver", ver);
    localStorage.setItem('remoteButtonVersion', ver);
    setActive(ver);
    const url = getActiveRemoteUrl();
    const Module = await loadRemoteModule({
      url,
      scope: 'remoteButton',
      module: './Button'
    });
    setRemoteButton(() => Module);
  };

  useEffect(() => {
    load(active);
  }, []);

  return (
    <main style={{ fontFamily: 'sans-serif' }}>
      <h1>POC Federación Versionada</h1>
      <p>Versión actual: <strong>{active}</strong></p>

      <button onClick={() => load('v1')}>Cargar v1</button>
      <button onClick={() => load('v2')}>Cargar v2</button>

      <hr />
      {RemoteButton ? <RemoteButton /> : <em>loading…</em>}
    </main>
  );
}
