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

    hubConnection.on('parametrosCambiados', (message: string) => {
      console.log('Nueva versión recibida:', message)
      setLastMessage(message)
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

  const getDisplayValue = (value: string) => {
    return value === '1' ? 'Activo' : 'Inactivo'
  }

  const handleVersionChange = (field: keyof Parametros, value: string) => {
    const newEditedParametros = { ...editedParametros, [field]: value }
    setEditedParametros(newEditedParametros)
    
    const hasChanges = newEditedParametros.usaParametro1 !== parametros.usaParametro1 || 
                      newEditedParametros.usaParametro2 !== parametros.usaParametro2 ||
                      newEditedParametros.usaParametro3 !== parametros.usaParametro3
    setHasChanges(hasChanges)
  }

  const handleToggle = (field: keyof Parametros) => {
    const currentValue = editedParametros[field]
    const newValue = currentValue === '1' ? '0' : '1'
    handleVersionChange(field, newValue)
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
          Dashboard de configuraciones
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
              <th>Parámetro</th>
              <th>Valor actual</th>
              <th>Cambiar valor</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="component-name">USA_PARAMETRO_1</td>
              <td className="current-version">{getDisplayValue(parametros.usaParametro1)}</td>
              <td className="edit-cell">
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={editedParametros.usaParametro1 === '1'}
                      onChange={() => handleToggle('usaParametro1')}
                      disabled={isLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {getDisplayValue(editedParametros.usaParametro1)}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="component-name">USA_PARAMETRO_2</td>
              <td className="current-version">{getDisplayValue(parametros.usaParametro2)}</td>
              <td className="edit-cell">
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={editedParametros.usaParametro2 === '1'}
                      onChange={() => handleToggle('usaParametro2')}
                      disabled={isLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {getDisplayValue(editedParametros.usaParametro2)}
                  </span>
                </div>
              </td>
            </tr>
            <tr>
              <td className="component-name">USA_PARAMETRO_3</td>
              <td className="current-version">{getDisplayValue(parametros.usaParametro3)}</td>
              <td className="edit-cell">
                <div className="toggle-container">
                  <label className="toggle-switch">
                    <input
                      type="checkbox"
                      checked={editedParametros.usaParametro3 === '1'}
                      onChange={() => handleToggle('usaParametro3')}
                      disabled={isLoading}
                    />
                    <span className="toggle-slider"></span>
                  </label>
                  <span className="toggle-label">
                    {getDisplayValue(editedParametros.usaParametro3)}
                  </span>
                </div>
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
    </div>
  )
}

export default App
