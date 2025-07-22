import { useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr';
import './App.css'

type Parametro = {
  descripcion: string;
  nodo: number;
  valor: number;
  activo: boolean;
}

type Referral = {
  id: number;
  especialidad: string; // Odontología, Pediatría, etc.
  nodoOrigen: string; // Eg. CESFAM de Pichilemu
  nodoDestino: string; // Eg. Hospital de Pichilemu
  fecha: string; // Eg. 2025-07-22
  estado: string; // Eg. Pendiente, Enviado, Rechazado, Atendido
  observaciones: string; // Eg. "El paciente no pudo ser atendido por falta de turno"
  nombrePaciente: string; // Eg. "Juan Pérez"
  rutPaciente: string; // Eg. 12345678-9
  nombreFuncionario: string; // Eg. "Juan Pérez"
  rutFuncionario: string; // Eg. 12345678-9
}

function App() {
  const [worker, setWorker] = useState<Worker | null>(null)
  const [results, setResults] = useState<Parametro[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [tabId, setTabId] = useState<string | null>(null)
  const [parametros, setParametros] = useState<Parametro[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])

  const thisTabIsActive = tabId === activeTabId

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub')
      .build()
    
    connection.on('parametrosCambiados', (parametros) => {
      // {usaParametro1: '0', usaParametro2: '0', usaParametro3: '0'}
      // These must be converted to a Parametro[]
      const parametrosRecibidos = Object.entries(parametros).map(([descripcion, valor]) => ({
        descripcion,
        nodo: 0,
        valor: valor === '1' ? 1 : 0,
        activo: true
      }))
      setParametros(parametrosRecibidos)
      console.log("### parametrosCambiados", parametrosRecibidos);
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
      if (event.data.type === 'derivacionesObtenidas') {
        const newReferrals: Referral[] = []
        for (const row of event.data.derivaciones) {
          const referral: Referral = {
            id: row[0],
            especialidad: row[1],
            nodoOrigen: row[2],
            nodoDestino: row[3],
            fecha: row[4],
            estado: row[5],
            observaciones: row[6],
            nombrePaciente: row[7],
            rutPaciente: row[8],
            nombreFuncionario: row[9],
            rutFuncionario: row[10]
          }
          newReferrals.push(referral)
        }
        setReferrals(newReferrals)
      } else if (event.data.type === 'parametrosObtenidos') {
        const newParametros: Parametro[] = []
        for (const row of event.data.parametros) {
          const parametro: Parametro = {
            descripcion: row[0],
            nodo: row[1],
            valor: row[2],
            activo: true
          }
          newParametros.push(parametro)
        }
        setParametros(newParametros)
      }
    })
    setWorker(worker)
  }, [results, tabId, activeTabId])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Nueva': return '#f59e0b';
      case 'Enviada': return '#3b82f6';
      case 'Atendida': return '#10b981';
      case 'Rechazaao': return '#ef4444';
      default: return '#6b7280';
    }
  }

  const obtenerDerivaciones = () => {
    worker?.postMessage({type: 'obtenerDerivaciones' })
  }

  const obtenerParametros = () => {
    worker?.postMessage({type: 'obtenerParametros' })
  }

  if (worker && referrals.length === 0) {
    obtenerDerivaciones()
  }

  if (worker && parametros.length === 0) {
    obtenerParametros()
  }

  return (
    <div className="app-container">
      {/* Header */}
      <div className="header">
        <div className="header-left">
          <h1>Derivación Contralor</h1>
        </div>
        <div className="header-right">
          <div className="connection-status">
            Dr. Roberto Silva
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Left Sidebar */}
        <div className="sidebar">
          {/* Active Status */}
          <div className="sidebar-section">
            <h3>ESTADO DE LA TAB</h3>
            <div className={`status-indicator ${thisTabIsActive ? 'active' : 'inactive'}`}>
              ({thisTabIsActive ? 'Activo' : 'Inactivo'})
            </div>
          </div>

          {/* System Parameters */}
          <div className="sidebar-section">
            <h3>PARÁMETROS DEL NODO</h3>
            <div className="parameters-list">
              {parametros.map((param, index) => (
                <div key={index} className="parameter-item">
                  <div className="parameter-desc">{param.descripcion}</div>
                  <div className="parameter-value">{param.valor}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Operation Queue */}
          <div className="sidebar-section">
            <h3>OPERACIONES</h3>
            <div className="operation-queue">
              <button onClick={obtenerParametros} className="queue-button">
                Obtener Parámetros
              </button>
              <button onClick={obtenerDerivaciones} className="queue-button">
                Obtener Derivaciones
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="content-area">
          <div className="content-body">
            <div className="referrals-list">
              {referrals.map((referral) => (
                <div key={referral.id} className="referral-card">
                  <div className="referral-header">
                    <div className="referral-title">
                      <h3>{referral.especialidad}</h3>
                      <span 
                        className="status-badge" 
                        style={{ backgroundColor: getEstadoColor(referral.estado) }}
                      >
                        {referral.estado}
                      </span>
                    </div>
                    <div className="referral-date">{referral.fecha}</div>
                  </div>
                  
                  <div className="referral-body">
                    <div className="referral-row">
                      <div className="referral-field">
                        <label>Paciente:</label>
                        <span>{referral.nombrePaciente}</span>
                      </div>
                      <div className="referral-field">
                        <label>RUT:</label>
                        <span>{referral.rutPaciente}</span>
                      </div>
                    </div>
                    
                    <div className="referral-row">
                      <div className="referral-field">
                        <label>Origen:</label>
                        <span>{referral.nodoOrigen}</span>
                      </div>
                      <div className="referral-field">
                        <label>Destino:</label>
                        <span>{referral.nodoDestino}</span>
                      </div>
                    </div>
                    
                    <div className="referral-row">
                      <div className="referral-field">
                        <label>Funcionario:</label>
                        <span>{referral.nombreFuncionario}</span>
                      </div>
                      <div className="referral-field">
                        <label>RUT Funcionario:</label>
                        <span>{referral.rutFuncionario}</span>
                      </div>
                    </div>
                    
                    <div className="referral-observations">
                      <label>Observaciones:</label>
                      <p>{referral.observaciones}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
