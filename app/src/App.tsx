import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import logo from './logo.svg'

import './App.css'

const socket = io('http://localhost:8080')

function App (): JSX.Element {
  const [ connection, setConnection ] = useState({ id: 'Unknown', isConnected: false })

  function connect (): void {
    console.log('connect()')
    socket.connect()
  }

  function disconnect (): void {
    console.log('disconnect()')
    const s = socket.disconnect()
    setConnection({
      id: s.id,
      isConnected: s.connected
    })
  }

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected:', socket.id)
      setConnection({
        id: socket.id,
        isConnected: socket.connected
      })
    })

    socket.on('shutdown', (data: any) => {
      console.log('SHUTDOWN')
      console.log(data)
      disconnect()
    })

    socket.on('disconnect', (reason: string) => {
      console.log(`disconnected (${reason})`)
      setConnection({
        id: socket.id,
        isConnected: socket.connected
      })
    })

    return () => {
      disconnect()
    }
  }, [])

  return (
    <div className="App">
      <header className="App-header">
        <img
          alt="logo"
          className={`App-logo ${connection.isConnected ? 'running' : 'stop'}`}
          src={logo}/>
        <p>
          {connection.isConnected ? `Connecté (${connection.id})` : 'Déconnecté'}
        </p>
        <p>
          {
            connection.isConnected
              ? <button onClick={disconnect}>Déconnecter</button>
              : <button onClick={connect}>Connecter</button>
          }
        </p>
      </header>
    </div>
  )
}

export default App
