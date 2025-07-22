import { useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr'
import './App.css'

interface Parametros {
  usaParametro1: string
  usaParametro2: string
  usaParametro3: string
}

// interface ReceivedMessage {
//   message: string
//   timestamp: Date
// }

function App() {
  const [parametros, setParametros] = useState<Parametros>({ usaParametro1: '', usaParametro2: '', usaParametro3: '' })
  const [editedParametros, setEditedParametros] = useState<Parametros>({ usaParametro1: '', usaParametro2: '', usaParametro3: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string>('')
  const [lastMessage, setLastMessage] = useState<string>('')

  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub', {
        withCredentials: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    hubConnection.on('parametrosCambiados', (message: any) => {
      console.log('Nueva versión recibida:', message)
      // setLastMessage(message)
    })

    const startConnection = async () => {
      try {
        await hubConnection.start()
        console.log('SignalR connected successfully')
        setError('')
      } catch (err) {
        console.error('SignalR connection error:', err)
        setError('Error connecting to SignalR: ' + (err instanceof Error ? err.message : 'Unknown error'))
        
        setTimeout(() => {
          console.log('Retrying SignalR connection...')
          startConnection()
        }, 5000)
      }
    }

    startConnection()

    return () => {
      hubConnection.stop()
    }
  }, [])

  useEffect(() => {
    fetchVersions()
  }, [])

  const fetchVersions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5018/parametros/1')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Parametros = await response.json()
      setParametros(data)
      setEditedParametros(data)
    } catch (err) {
      setError('Error fetching versions: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Error fetching versions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionChange = (field: keyof Parametros, value: string) => {
    const newEditedParametros = { ...editedParametros, [field]: value }
    setEditedParametros(newEditedParametros)
    
    const hasChanges = newEditedParametros.usaParametro1 !== parametros.usaParametro1 || 
                      newEditedParametros.usaParametro2 !== parametros.usaParametro2 ||
                      newEditedParametros.usaParametro3 !== parametros.usaParametro3
    setHasChanges(hasChanges)
  }

  const updateVersions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5018/parametros', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedParametros),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      setParametros(editedParametros)
      setHasChanges(false)
      console.log('Versions updated successfully')
    } catch (err) {
      setError('Error updating versions: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Error updating versions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const resetChanges = () => {
    setEditedParametros(parametros)
    setHasChanges(false)
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Dashboard de versiones
        </h1>
      </div>

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          {error}
        </div>
      )}

      <div className="version-table-container">
        <table className="version-table">
          <thead>
            <tr>
              <th>Componente</th>
              <th>Versión Actual</th>
              <th>Editar</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="component-name">UsaParametro1</td>
              <td className="current-version">{parametros.usaParametro1}</td>
              <td className="edit-cell">
                <input
                  type="text"
                  value={editedParametros.usaParametro1}
                  onChange={(e) => handleVersionChange('usaParametro1', e.target.value)}
                  placeholder="Ingresa nueva versión"
                  disabled={isLoading}
                  className="version-input"
                />
              </td>
            </tr>
            <tr>
              <td className="component-name">UsaParametro2</td>
              <td className="current-version">{parametros.usaParametro2}</td>
              <td className="edit-cell">
                <input
                  type="text"
                  value={editedParametros.usaParametro2}
                  onChange={(e) => handleVersionChange('usaParametro2', e.target.value)}
                  placeholder="Ingresa nueva versión"
                  disabled={isLoading}
                  className="version-input"
                />
              </td>
            </tr>
            <tr>
              <td className="component-name">UsaParametro3</td>
              <td className="current-version">{parametros.usaParametro3}</td>
              <td className="edit-cell">
                <input
                  type="text"
                  value={editedParametros.usaParametro3}
                  onChange={(e) => handleVersionChange('usaParametro3', e.target.value)}
                  placeholder="Ingresa nueva versión"
                  disabled={isLoading}
                  className="version-input"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="action-buttons">
        <button
          className="update-btn"
          onClick={updateVersions}
          disabled={!hasChanges || isLoading}
        >
          {isLoading ? (
            <>
              <div className="loading-spinner"></div>
              Actualizando...
            </>
          ) : (
            <>
              <span className="btn-icon">💾</span>
              Actualizar versiones
            </>
          )}
        </button>

        {hasChanges && (
          <button
            className="reset-btn"
            onClick={resetChanges}
            disabled={isLoading}
          >
            <span className="btn-icon">↩️</span>
            Descartar cambios
          </button>
        )}
      </div>

      {lastMessage && (
        <div className="messages-section">
          <h3 className="messages-title">Último mensaje del websocket</h3>
          <div className="messages-container">
            <div className="message-item">
              <div className="message-content">
                <span className="message-text">{lastMessage}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
