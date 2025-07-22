import { useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr';
import './App.css'

type Parametro = {
  descripcion: string;
  nodo: number;
  valor: number;
  activo: boolean;
}

function App() {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [results, setResults] = useState<Parametro[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [tabId, setTabId] = useState<string | null>(null)

  const thisTabIsActive = tabId === activeTabId

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub')
      .build()
    
    connection.on('nuevaVersionRecibida', (modulos) => {
      console.log("### modulos", modulos);
    })

    connection.start().catch(err => console.error(err));
  })

  useEffect(() => {
    const worker = new SharedWorker(new URL('./sharedWorker.js', import.meta.url), { type: 'module' });
    const tabId = Math.random().toString(36).substr(2);
    setTabId(tabId)
    window.addEventListener('focus', () => {
      worker.port.postMessage({ type: 'focus', tabId });
    });
    worker.port.onmessage = (e) => {
      const { type, tabId: activeTabId } = e.data;

      if (type === 'active-tab') {
        setActiveTabId(activeTabId)
      }
    };
    worker.port.start();
  }, [])

  useEffect(() => {
    const worker = new Worker(new URL('./worker.js', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (event) => {
      const parametros = event.data.map((row: Array<string>) => ({
        descripcion: row[0],
        nodo: parseInt(row[1]),
        valor: parseInt(row[2]),
        activo: row[3]
      }))
      setResults([...results, ...parametros])
    })
    setWorker(worker)
  }, [results, tabId, activeTabId])

  return (
    <div>
      <div>
        ACTIVO: {thisTabIsActive ? 'SI' : 'NO'}
      </div>
      <div className="card">
        <button onClick={() => {
          worker?.postMessage({type: 'query', query: `SELECT * FROM parametros`})
        }}>
          Obtener parametros
        </button>
      </div>
      <div>
        {results.map((result, index) => (
          <p key={index}>{result.descripcion} - {result.nodo} - {result.valor} - {result.activo ? 'SI' : 'NO'}</p>
        ))}
      </div>
    </div>
  )
}

export default App
