import React, { useState, useEffect } from 'react'
import { io } from 'socket.io-client'
import logo from './logo.svg'

import './App.css'

const { protocol, hostname } = window.location
const uri = `${protocol}//${hostname}:8080`

// const socket = io(uri, { autoConnect: false })
const socket = io(uri, {
  transports: ['websocket'],
  withCredentials: true,
  // extraHeaders: {
  //   "my-custom-header": "abcd",
  // },
})

function Client (props: { path: string }): JSX.Element {
  const [connecting, isConnecting] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const [connection, setConnection] = useState<{ id: string | null; gameId: string | null; isConnected: boolean }>({
    id: null,
    gameId: null,
    isConnected: false,
  })

  const [requestedGameId, setRequestedGameId] = useState('')

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
    socket.disconnect()
  }

  function join (): void {
    console.log(`Trying to join ${requestedGameId ? `"${requestedGameId}"` : 'a game'}...`)
    //socket.emit('game:join',null, (response:any) =>{
    //socket.emit('game:join','asked one', 'param1', 'param2', (response:any) =>{
    socket.emit('game:join', { gameId: requestedGameId }, (response: any) => {
      setConnection({ ...connection, gameId: response.gameId })
      if (response.gameId === null) {
        console.log(`${requestedGameId} doesn't exists`)
        setRequestedGameId('')
      }
      else {
        console.log(`Welcome to ${response.gameId} !`)
      }
    })
  }

  function leave (): void {
    socket.emit('game:leave', { gameId: connection.gameId }, (response: any) => {
      if (response.ok) {
        setConnection({
          id: connection.id,
          gameId: null,
          isConnected: connection.isConnected,
        })
      }
    })
  }

  useEffect(() => {
    socket
      .on('msg', (message: string) => {
        console.log(`[msg] ${message}`)
      })
      .on('connect', () => {
        console.log('connected:', socket.id)
        isConnecting(false)
        setConnection({
          id: socket.id,
          gameId: null,
          isConnected: socket.connected,
        })
        setAttempt(0)
      })
      .on("connect_error", (err: Error) => {
        switch (err.message) {
          case 'xhr poll error':
            console.warn('Server polling via XHR')
            break
          default:
            console.error(err)
        }
      })
      .on('reconnecting', (attempt: number) => {
        console.log('reconnecting... ' + attempt)
        setAttempt(attempt)
      })
      .on('reconnect_error', (error: Error) => console.log('reconnect_error', error.message))
      .on('shutdown', () => {
        console.log('Server shutdown')
        disconnect()
      })
      .on('disconnect', (reason: string) => {
        console.log(`disconnected (${reason})`)
        isConnecting(false)
        setRequestedGameId('')
        setConnection({
          id: socket.id,
          gameId: null,
          isConnected: socket.connected,
        })
      })

    return () => {
      console.log('cleanUp')
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
          {connection.isConnected
            ?
            <div>
              <input
                disabled={!!connection.gameId}
                style={{ width: '200px' }}
                type="text"
                value={connection.gameId || requestedGameId}
                onChange={e => setRequestedGameId(e.target.value)}
              />

              <button onClick={leave}>Leave</button>
              <button onClick={join}>Join</button>

              <br/>
              <button onClick={disconnect}>Déconnecter</button>
            </div>
            :
            <div>
              <button
                onClick={connect}>{connecting ? `Connexion en cours${'.'.padEnd(1 + attempt % 3, '.')}` : 'Connecter'}
              </button>
              {connecting && attempt > 0 && <button onClick={disconnect}>Annuler</button>}
            </div>
          }
        </div>
      </header>
    </div>
  )
}

export default Client
