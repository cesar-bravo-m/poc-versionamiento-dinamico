import { useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr'
import './App.css'

interface Version {
  admision: string
  citas: string
}

interface ReceivedMessage {
  message: string
  timestamp: Date
}

function App() {
  const [versions, setVersions] = useState<Version>({ admision: '', citas: '' })
  const [editedVersions, setEditedVersions] = useState<Version>({ admision: '', citas: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  const [error, setError] = useState<string>('')
  const [lastMessage, setLastMessage] = useState<ReceivedMessage | null>(null)

  // Initialize SignalR connection
  useEffect(() => {
    const hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('http://localhost:5018/hub', {
        withCredentials: false,
        transport: signalR.HttpTransportType.WebSockets | signalR.HttpTransportType.LongPolling,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build()

    hubConnection.on('nuevaVersionRecibida', (message: string[]) => {
      console.log('Nueva versión recibida:', message)
      setLastMessage({
        message: message.join(', '),
        timestamp: new Date()
      })
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

  // Fetch current versions on component mount
  useEffect(() => {
    fetchVersions()
  }, [])

  const fetchVersions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5018/versiones/1')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data: Version = await response.json()
      setVersions(data)
      setEditedVersions(data)
    } catch (err) {
      setError('Error fetching versions: ' + (err instanceof Error ? err.message : 'Unknown error'))
      console.error('Error fetching versions:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVersionChange = (field: keyof Version, value: string) => {
    const newEditedVersions = { ...editedVersions, [field]: value }
    setEditedVersions(newEditedVersions)
    
    // Check if there are changes compared to original versions
    const hasChanges = newEditedVersions.admision !== versions.admision || 
                      newEditedVersions.citas !== versions.citas
    setHasChanges(hasChanges)
  }

  const updateVersions = async () => {
    setIsLoading(true)
    setError('')
    try {
      const response = await fetch('http://localhost:5018/versiones', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editedVersions),
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      // Update the original versions and reset change tracking
      setVersions(editedVersions)
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
    setEditedVersions(versions)
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
              <td className="component-name">Admisión</td>
              <td className="current-version">{versions.admision}</td>
              <td className="edit-cell">
                <input
                  type="text"
                  value={editedVersions.admision}
                  onChange={(e) => handleVersionChange('admision', e.target.value)}
                  placeholder="Ingresa nueva versión"
                  disabled={isLoading}
                  className="version-input"
                />
              </td>
            </tr>
            <tr>
              <td className="component-name">Citas</td>
              <td className="current-version">{versions.citas}</td>
              <td className="edit-cell">
                <input
                  type="text"
                  value={editedVersions.citas}
                  onChange={(e) => handleVersionChange('citas', e.target.value)}
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
                <span className="message-text">{lastMessage.message}</span>
              </div>
              <div className="message-timestamp">
                {lastMessage.timestamp.toLocaleString('es-ES', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit'
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
