import { useState, useEffect } from 'react'
import * as signalR from '@microsoft/signalr';
import './App.css'

const hubConnection = new signalR.HubConnectionBuilder()
  .withUrl('http://localhost:5018/hub')
  .build()

hubConnection.on('messageReceived', (message: string) => {
  console.log("### MESSAGE RECEIVED ###", message);
})

hubConnection.start()
  .then(async () => {
    await hubConnection.send('newMessage', 123123, 'v1')
  })
  .catch( err => console.log("### err", err))

function App() {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null)
  const [isConnected, setIsConnected] = useState(true)
  const [lastMessage, setLastMessage] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  // useEffect(() => {
  //   const hubConnection = new signalR.HubConnectionBuilder()
  //     .withUrl('http://localhost:5018/hub')
  //     .build()

  //   hubConnection.on('messageReceived', (message: string) => {
  //     console.log("### MESSAGE RECEIVED ###", message);
  //   })

  //   hubConnection.start().catch( err => console.log("### err", err))

  //   setConnection(hubConnection)

  //   return () => {
  //     hubConnection.stop()
  //   }
  // }, [])

  const sendVersionMessage = async (username: string,version: string) => {
    if (hubConnection && isConnected) {
      setIsLoading(true)
      try {
        await hubConnection.send('newMessage', username, version)
        console.log(`Sent version message: ${version}`)
      } catch (err) {
        console.error('Error sending message: ', err)
      } finally {
        setIsLoading(false)
      }
    } else {
      console.error('SignalR connection not available')
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          <span className="title-icon">🚀</span>
          Version Dashboard
        </h1>
        <div className="connection-status">
          <div className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
            <div className="status-dot"></div>
            <span>{isConnected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
      </div>

      <div className="version-controls">
        <div className="version-buttons">
          <button 
            className="version-btn v1-btn"
            onClick={() => sendVersionMessage('versionchange', 'v1')}
            disabled={!isConnected || isLoading}
          >
            <div className="btn-content">
              <span className="btn-icon">📦</span>
              <span className="btn-text">Cargar V1</span>
            </div>
            {isLoading && <div className="loading-spinner"></div>}
          </button>

          <button 
            className="version-btn v2-btn"
            onClick={() => sendVersionMessage('versionchange', 'v2')}
            disabled={!isConnected || isLoading}
          >
            <div className="btn-content">
              <span className="btn-icon">⚡</span>
              <span className="btn-text">Cargar V2</span>
            </div>
            {isLoading && <div className="loading-spinner"></div>}
          </button>
        </div>
      </div>

      {lastMessage && (
        <div className="message-display">
          <h3>Último mensaje enviado:</h3>
          <div className="message-content">
            <span className="message-text">{lastMessage}</span>
          </div>
        </div>
      )}

      <div className="dashboard-footer">
        <p>Selecciona una versión para cargar a través de SignalR</p>
      </div>
    </div>
  )
}

export default App
