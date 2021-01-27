import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import logo from './logo.svg'

import './App.css'

const { protocol, hostname } = window.location
const uri = `${protocol}//${hostname}:8080`
// const socket = io(uri, { autoConnect: false })
const socket = io(uri)

function Client (props: { path: string }): JSX.Element {
  const [ connecting, isConnecting ] = useState(false)
  const [ attempt, setAttempt ] = useState(0)
  const [ connection, setConnection ] = useState({
    id: 'Unknown',
    isConnected: false
  })

  function connect (): void {
    if (!connecting) {
      console.log('connect()')
      socket.connect()
      isConnecting(true)
    }
  }

  function disconnect (): void {
    console.log('disconnect()')
    isConnecting(false)
    const s = socket.disconnect()
    setConnection({
      id: s.id,
      isConnected: s.connected
    })
  }

  useEffect(() => {
    socket
      .on('connect', () => {
        console.log('connected:', socket.id)
        isConnecting(false)
        setConnection({
          id: socket.id,
          isConnected: socket.connected
        })
        setAttempt(0)
      })
      .on('reconnecting', (attempt: number) => {
        console.log('reconnecting... ' + attempt)
        setAttempt(attempt)
      })
      .on('reconnect_error', (error: Error) => console.log('reconnect_error', error.message))
      .on('shutdown', (data: any) => {
        console.log('Server shutdown')
        console.log(data)
        disconnect()
      })
      .on('disconnect', (reason: string) => {
        console.log(`disconnected (${reason})`)
        isConnecting(false)
        setConnection({
          id: socket.id,
          isConnected: socket.connected
        })
      })

    return () => {
      console.log('unmount')
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
          {connection.isConnected ? `Connecté (${connection.id})` : `Déconnecté`}
        </p>
        <div>
          {
            connection.isConnected
              ? <button onClick={disconnect}>Déconnecter</button>
              : (<div>
                <button
                  onClick={connect}>{connecting ? `Connexion en cours${'.'.padEnd(1 + attempt % 3, '.')}` : 'Connecter'}</button>
                {connecting && attempt > 0 && <button onClick={disconnect}>Annuler</button>}
              </div>)
          }
        </div>
      </header>
    </div>
  )
}

export default Client
