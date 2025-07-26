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
  especialidad: string;
  nodoOrigen: string;
  nodoDestino: string;
  fecha: string;
  estado: string;
  observaciones: string;
  nombrePaciente: string;
  rutPaciente: string;
  nombreFuncionario: string;
  rutFuncionario: string;
}

function App() {
  const [sqlWorker, setSqlWorker] = useState<SharedWorker | null>(null)
  const [opfsWorker, setOpfsWorker] = useState<Worker | null>(null)
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const [tabId, setTabId] = useState<string | null>(null)
  const [parametros, setParametros] = useState<Parametro[]>([])
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingReferral, setEditingReferral] = useState<Referral | null>(null)
  const [apiCalls, setApiCalls] = useState<{id: string, referralIds?: number[], timestamp: Date, status: 'pending' | 'completed' | 'failed', isBundled?: boolean, totalEdits?: number, type?: 'referrals' | 'parameters'}[]>([])
  const [expandedReferrals, setExpandedReferrals] = useState<Set<number>>(new Set([1, 2, 3]))
  const [globalTimeout, setGlobalTimeout] = useState<number | null>(null)
  const [pendingReferrals, setPendingReferrals] = useState<Set<number>>(new Set())
  const [waitingForSync, setWaitingForSync] = useState<{timestamp: Date, referralCount: number} | null>(null)

  const thisTabIsActive = tabId === activeTabId

  useEffect(() => {
    const worker = new Worker(new URL('./opfsWorker.js', import.meta.url), { type: 'module' })
    worker.addEventListener('message', (event) => {
      console.log("### OPFS event", event);
    })
    setOpfsWorker(worker)
  }, [])

  useEffect(() => {
    console.log('Pending referrals changed:', Array.from(pendingReferrals))
  }, [pendingReferrals])

  useEffect(() => {
    const connection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub')
      .build()
    
    connection.on('parametrosCambiados', async (parametros) => {
      console.log("### parametrosCambiados event received", parametros);
      
      createParameterUpdateCall()
      
      await fetchParametrosFromEndpoint()
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
    const worker = new SharedWorker(new URL('./sqlWorker.js', import.meta.url), { type: 'module' })
    
    worker.port.addEventListener('message', (event) => {
      console.log("### event:", event);
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
      } else if (event.data.type === 'derivacionActualizada') {
        setReferrals(prev => prev.map(ref => 
          ref.id === event.data.id 
            ? {
                ...ref,
                estado: event.data.estado,
                observaciones: event.data.observaciones,
                nombrePaciente: event.data.nombrePaciente,
                rutPaciente: event.data.rutPaciente,
                nombreFuncionario: event.data.nombreFuncionario,
                rutFuncionario: event.data.rutFuncionario
              }
            : ref
        ))
        setEditingId(null)
        setEditingReferral(null)
      } else if (event.data.type === 'parametrosActualizados') {
        console.log('Parameters updated in database:', event.data.parametros)
      } else if (event.data.type === 'log') {
        // console.log("### event.data.log", event.data.log);
      }
    })
    
    worker.port.start()
    setSqlWorker(worker)
  }, [tabId, activeTabId])

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Nueva': return '#f59e0b';
      case 'Enviada': return '#3b82f6';
      case 'Atendida': return '#10b981';
      case 'Rechazada': return '#ef4444';
      default: return '#6b7280';
    }
  }

  const obtenerDerivaciones = () => {
    sqlWorker?.port.postMessage({type: 'obtenerDerivaciones' })
  }

  const escribirArchivo = () => {
    // NO FUNCIONA EN UN SHARED WORKER@!@!!
    // sqlWorker?.port.postMessage({type: 'persistToFile' })
    opfsWorker?.postMessage({type: 'persistToFile' })
  }

  const fetchParametrosFromEndpoint = async () => {
    try {
      const response = await fetch('http://localhost:5018/parametros/1')
      const data = await response.json()
      
      const endpointParametros: Parametro[] = Object.entries(data).map(([descripcion, valor]) => ({
        descripcion,
        nodo: 1,
        valor: valor === '1' ? 1 : 0,
        activo: true
      }))
      
      console.log('Fetched parameters from endpoint:', endpointParametros)
      
       const currentValues = parametros.map(p => `${p.descripcion}:${p.valor}`).sort()
       const endpointValues = endpointParametros.map(p => `${p.descripcion}:${p.valor}`).sort()
       
       const parametersChanged = JSON.stringify(currentValues) !== JSON.stringify(endpointValues)
      
      if (parametersChanged) {
        console.log('Parameters changed, updating database and UI')
        
        setParametros(endpointParametros)
        
        if (sqlWorker) {
          sqlWorker.port.postMessage({
            type: 'actualizarParametros',
            parametros: endpointParametros
          })
        }
      } else {
        console.log('Parameters unchanged')
      }
      
      return endpointParametros
    } catch (error) {
      console.error('Error fetching parameters:', error)
      return null
    }
  }

  const obtenerParametros = () => {
    sqlWorker?.port.postMessage({type: 'obtenerParametros' })
  }

  const createParameterUpdateCall = () => {
    if (!thisTabIsActive) return
    
    const callId = Math.random().toString(36).substr(2, 9)
    const newCall = {
      id: callId,
      timestamp: new Date(),
      status: 'pending' as const,
      type: 'parameters' as const,
      isBundled: false,
      totalEdits: 1
    }
    
    setApiCalls(prev => [...prev, newCall])
    
    const timeout = Math.random() * 2000 + 1000
    setTimeout(() => {
      const success = true
      setApiCalls(prev => prev.map(call => 
        call.id === callId 
          ? { ...call, status: success ? 'completed' : 'failed' }
          : call
      ))
      setTimeout(() => {
        setApiCalls(prev => prev.filter(call => call.id !== callId))
      }, 3000)
    }, timeout)
  }

  const startEditing = (referral: Referral) => {
    setEditingId(referral.id)
    setEditingReferral({ ...referral })
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingReferral(null)
  }

  const createGlobalApiCall = () => {
    if (!thisTabIsActive) return
    
    setPendingReferrals(currentPending => {
      const referralIds = Array.from(currentPending)
      console.log('Creating global API call for referrals:', referralIds)
      
      if (referralIds.length === 0) return currentPending
      
      const callId = Math.random().toString(36).substr(2, 9)
      const isBundled = referralIds.length > 1
      const newCall = {
        id: callId,
        referralIds,
        timestamp: new Date(),
        status: 'pending' as const,
        isBundled,
        totalEdits: referralIds.length
      }
      
      setApiCalls(prev => [...prev, newCall])
      
      setWaitingForSync(null)
      
      const timeout = Math.random() * 3000 + 2000
      setTimeout(() => {
        const success = true;
        setApiCalls(prev => prev.map(call => 
          call.id === callId 
            ? { ...call, status: success ? 'completed' : 'failed' }
            : call
        ))
        setTimeout(() => {
          setApiCalls(prev => prev.filter(call => call.id !== callId))
        }, 3000)
      }, timeout)
      
      return new Set()
    })
  }

  const saveChanges = () => {
    if (editingReferral && sqlWorker) {
      sqlWorker.port.postMessage({
        type: 'actualizarDerivacion',
        id: editingReferral.id,
        estado: editingReferral.estado,
        observaciones: editingReferral.observaciones,
        nombrePaciente: editingReferral.nombrePaciente,
        rutPaciente: editingReferral.rutPaciente,
        nombreFuncionario: editingReferral.nombreFuncionario,
        rutFuncionario: editingReferral.rutFuncionario
      })
      
      const referralId = editingReferral.id
      
      if (globalTimeout) {
        clearTimeout(globalTimeout)
        setGlobalTimeout(null)
      }
      
      setPendingReferrals(prev => {
        const newSet = new Set([...prev, referralId])
        console.log('Updated pending referrals:', Array.from(newSet))
        
        setWaitingForSync({
          timestamp: new Date(),
          referralCount: newSet.size
        })
        
        return newSet
      })
      
      const timeoutId = setTimeout(() => {
        createGlobalApiCall()
        setGlobalTimeout(null)
      }, 5000)
      
      setGlobalTimeout(timeoutId)
    }
  }

  const updateEditingField = (field: keyof Referral, value: string) => {
    if (editingReferral) {
      setEditingReferral(prev => prev ? { ...prev, [field]: value } : null)
    }
  }

  const toggleReferralExpanded = (referralId: number) => {
    setExpandedReferrals(prev => {
      const newSet = new Set(prev)
      if (newSet.has(referralId)) {
        newSet.delete(referralId)
      } else {
        newSet.add(referralId)
      }
      return newSet
    })
  }

  if (sqlWorker && referrals.length === 0) {
    obtenerDerivaciones()
  }

  if (sqlWorker && parametros.length === 0) {
    obtenerParametros()
    fetchParametrosFromEndpoint()
  }

  return (
    <div className="app-container">
      <div className="header">
        <div className="header-left">
          <h1>Derivación Contralor</h1>
        </div>
        <div className="header-right">
          <div>
            { thisTabIsActive && <div className="connection-status-active">TAB ACTIVA</div> }
            { !thisTabIsActive && <div className="connection-status-inactive">TAB DESCONECTADA</div> }
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="sidebar">
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

            <div className="sidebar-section">
              <h3>OPERACIONES</h3>
              <div className="operation-queue">
                <button onClick={obtenerParametros} className="queue-button">
                  Obtener Parámetros
                </button>
                <button onClick={obtenerDerivaciones} className="queue-button">
                  Obtener Derivaciones
                </button>
                <button onClick={() => {console.log("### here"); escribirArchivo(); console.log("### here 2");}} className="queue-button">
                  Escribir a OPFS
                </button>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>COLA DE EVENTOS (API, OPFS)</h3>
              <div className="persistence-queue">
                {thisTabIsActive && waitingForSync && (
                  <div className="waiting-indicator">
                    <div className="waiting-content">
                      <div className="waiting-header">
                        <span className="waiting-icon">
                          <span className="spinner">...</span>
                        </span>
                        <span className="waiting-text">
                          Esperando más cambios...
                        </span>
                      </div>
                      <div className="waiting-details">
                        <div className="waiting-count">
                          {waitingForSync.referralCount} derivación{waitingForSync.referralCount !== 1 ? 'es' : ''} pendiente{waitingForSync.referralCount !== 1 ? 's' : ''}
                        </div>
                        <div className="waiting-timestamp">
                          {waitingForSync.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
                {thisTabIsActive && apiCalls.length > 0 ? (
                  apiCalls.map((call) => {
                    const affectedReferrals = call.referralIds ? referrals.filter(r => call.referralIds!.includes(r.id)) : []
                    const isParameterCall = call.type === 'parameters'
                    
                    return (
                      <div key={call.id} className={`api-call-item ${call.status} ${call.isBundled ? 'bundled' : ''} ${isParameterCall ? 'parameter-call' : ''}`}>
                        <div className="api-call-content">
                          <div className="api-call-header">
                            <span className="api-call-icon">
                              {call.status === 'pending' && <span className="spinner">...</span>}
                              {call.status === 'completed' && 'OK'}
                              {call.status === 'failed' && 'ERR'}
                            </span>
                            <span className="api-call-text">
                              {isParameterCall && call.status === 'pending' && 'Actualizando parámetros...'}
                              {isParameterCall && call.status === 'completed' && 'Parámetros actualizados'}
                              {isParameterCall && call.status === 'failed' && 'Error actualizando parámetros'}
                              {!isParameterCall && call.isBundled && call.status === 'pending' && `Sincronizando ${call.totalEdits} derivaciones...`}
                              {!isParameterCall && call.isBundled && call.status === 'completed' && `${call.totalEdits} derivaciones sincronizadas`}
                              {!isParameterCall && call.isBundled && call.status === 'failed' && `Error: ${call.totalEdits} derivaciones`}
                              {!isParameterCall && !call.isBundled && call.status === 'pending' && 'Sincronizando...'}
                              {!isParameterCall && !call.isBundled && call.status === 'completed' && 'Sincronizado'}
                              {!isParameterCall && !call.isBundled && call.status === 'failed' && 'Error'}
                            </span>
                          </div>
                          <div className="api-call-details">
                            {isParameterCall ? (
                              <div className="api-call-parameter-info">
                                Sincronización de parámetros del sistema
                              </div>
                            ) : call.isBundled ? (
                              <div>
                                <div className="api-call-bundle-info">
                                  Sincronización global de {call.totalEdits} derivaciones
                                </div>
                                <div className="api-call-referrals-list">
                                  {affectedReferrals.map((ref) => (
                                    <div key={ref.id} className="api-call-referral-item">
                                      {ref.nombrePaciente} ({ref.especialidad})
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="api-call-patient">{affectedReferrals[0]?.nombrePaciente}</div>
                                <div className="api-call-specialty">{affectedReferrals[0]?.especialidad}</div>
                              </div>
                            )}
                            <div className="api-call-timestamp">
                              {call.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })
                ) : (
                  <div className="no-api-calls">
                    {thisTabIsActive ? 'No hay sincronizaciones pendientes' : 'Tab inactiva'}
                  </div>
                )}
              </div>
            </div>
        </div>

        <div className="content-area">
          <div className="content-body">
            <div className="referrals-list">
              {referrals.map((referral) => {
              const isEditing = editingId === referral.id
              const displayReferral = isEditing ? editingReferral! : referral
              const isExpanded = expandedReferrals.has(referral.id)
              
              return (
                <div key={referral.id} className="referral-card">
                  <div className="referral-header">
                    <div className="referral-title">
                      <h3>{displayReferral.especialidad}</h3>
                      {isEditing ? (
                        <select 
                          value={displayReferral.estado}
                          onChange={(e) => updateEditingField('estado', e.target.value)}
                          className="status-edit"
                        >
                          <option value="Nueva">Nueva</option>
                          <option value="Enviada">Enviada</option>
                          <option value="Atendida">Atendida</option>
                          <option value="Rechazada">Rechazada</option>
                        </select>
                      ) : (
                        <span 
                          className="status-badge" 
                          style={{ backgroundColor: getEstadoColor(displayReferral.estado) }}
                        >
                          {displayReferral.estado}
                        </span>
                      )}
                    </div>
                    <div className="referral-actions">
                      <div className="referral-date">{displayReferral.fecha}</div>
                      <button 
                        className="collapse-button"
                        onClick={() => toggleReferralExpanded(referral.id)}
                        title={isExpanded ? "Colapsar detalles" : "Expandir detalles"}
                      >
                        {isExpanded ? 'Colapsar' : 'Expandir'}
                      </button>
                      {!isEditing && isExpanded && (
                        <button 
                          className="edit-button"
                          onClick={() => startEditing(referral)}
                          title="Editar derivación"
                        >
                          Editar
                        </button>
                      )}
                    </div>
                                    </div>
                  
                  {isExpanded && (
                    <div className="referral-body">
                      <div className="referral-row">
                        <div className="referral-field">
                          <label>Paciente:</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayReferral.nombrePaciente}
                              onChange={(e) => updateEditingField('nombrePaciente', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span>{displayReferral.nombrePaciente}</span>
                          )}
                        </div>
                        <div className="referral-field">
                          <label>RUT:</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayReferral.rutPaciente}
                              onChange={(e) => updateEditingField('rutPaciente', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span>{displayReferral.rutPaciente}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="referral-row">
                        <div className="referral-field">
                          <label>Origen:</label>
                          <span>{displayReferral.nodoOrigen}</span>
                        </div>
                        <div className="referral-field">
                          <label>Destino:</label>
                          <span>{displayReferral.nodoDestino}</span>
                        </div>
                      </div>
                      
                      <div className="referral-row">
                        <div className="referral-field">
                          <label>Funcionario:</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayReferral.nombreFuncionario}
                              onChange={(e) => updateEditingField('nombreFuncionario', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span>{displayReferral.nombreFuncionario}</span>
                          )}
                        </div>
                        <div className="referral-field">
                          <label>RUT Funcionario:</label>
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayReferral.rutFuncionario}
                              onChange={(e) => updateEditingField('rutFuncionario', e.target.value)}
                              className="edit-input"
                            />
                          ) : (
                            <span>{displayReferral.rutFuncionario}</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="referral-observations">
                        <label>Observaciones:</label>
                        {isEditing ? (
                          <textarea
                            value={displayReferral.observaciones}
                            onChange={(e) => updateEditingField('observaciones', e.target.value)}
                            className="edit-textarea"
                            rows={3}
                          />
                        ) : (
                          <p>{displayReferral.observaciones}</p>
                        )}
                      </div>
                      
                      {isEditing && (
                        <div className="edit-actions">
                          <button 
                            className="save-button"
                            onClick={saveChanges}
                          >
                            Guardar
                          </button>
                          <button 
                            className="cancel-button"
                            onClick={cancelEditing}
                          >
                            Descartar cambios
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
