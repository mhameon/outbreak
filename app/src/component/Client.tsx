import React, { useState, useEffect } from 'react'
import type { Socket } from 'socket.io-client'
import logo from '../logo.svg'

import '../App.css'
import { useSocket } from '../hook/useSocket'

const { protocol, hostname } = window.location
const uri = `${protocol}//${hostname}:8080`

function Client (): JSX.Element {
  //const [ client, initClient ] = useState<SocketProvider | null>(null)
  const client = useSocket(uri)

  const [ connecting, isConnecting ] = useState(false)
  const [ attempt, setAttempt ] = useState(0)
  const [ connection, setConnection ] = useState<{ id: string | null; gameId: string | null; isConnected: boolean }>({
    id: null,
    gameId: null,
    isConnected: false,
  })

  const [ requestedGameId, setRequestedGameId ] = useState('')

  function connect (c: Socket): void {
    console.log('connect()')
    if (!c) {
      console.error('client not initialized')
      return
    }
    if (!connecting) {
      c.connect()
      isConnecting(true)
    }
  }

  function disconnect (c: Socket): void {
    console.log('disconnect()')
    if (!c) {
      console.error('client not initialized')
      return
    }
    isConnecting(false)
    c.disconnect()
  }

  function join (c: Socket): void {
    console.log(`Trying to join ${requestedGameId ? `"${requestedGameId}"` : 'a game'}...`)
    if (!c) {
      console.error('client not initialized')
      return
    }

    c.emit('player:join:game', { requestedGameId }, (response: any) => {
      setConnection({ ...connection, gameId: response.gameId })
      if (response.gameId === null) {
        console.log(`${requestedGameId} doesn't exists`)
        setRequestedGameId('')
      } else {
        console.log(`Welcome to ${response.gameId} !`)
      }
    })
  }

  function leave (c: Socket): void {
    console.log('leaving...')
    if (!c) {
      console.error('client not initialized')
      return
    }
    c.emit('player:leave:game', { gameId: connection.gameId }, (response: any) => {
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
    // const client = io(uri, {
    //   transports: [ 'websocket' ],
    //   withCredentials: true,
    // })

    client
      .on('msg', (message: string) => {
        console.log(`[msg] ${message}`)
      })
      .onAny((message) => {
        console.log(`>>> ${message} (onAny)`)
      })
      .on('connect', () => {
        console.log('connected:', client.id)
        isConnecting(false)
        setConnection({
          id: client.id,
          gameId: null,
          isConnected: client.connected,
        })
        setAttempt(0)
      })
      .on('connect_error', (err: Error) => {
        switch (err.message) {
          case 'xhr poll error':
            console.warn('Server polling via XHR')
            break
          default:
            console.error(err)
        }
      })
      // .on('reconnecting', (attempt: number) => {
      //   console.log('reconnecting... ' + attempt)
      //   setAttempt(attempt)
      // })
      //.on('reconnect_error', (error: Error) => console.log('reconnect_error', error.message))
      .on('server:shutdown', () => {
        console.log('Server shutdown')
        disconnect(client)
      })
      .on('disconnect', (reason: string) => {
        console.log(`disconnected (${reason})`)
        isConnecting(false)
        setRequestedGameId('')
        setConnection({
          id: client.id,
          gameId: null,
          isConnected: client.connected,
        })
      })

    return () => {
      console.log('cleanUp')
      client.close()
    }
  }, [ client ])


  if (!client) {
    // catch and show some loading screen
    // while the socket connection gets ready
    return <div>Loading...</div>
  }

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

              <button onClick={() => leave(client)}>Leave</button>
              <button onClick={() => join(client)}>Join</button>

              <br/>
              <button onClick={() => disconnect(client)}>Déconnecter</button>
            </div>
            :
            <div>
              <button
                onClick={() => connect(client)}>{connecting ? `Connexion en cours${'.'.padEnd(1 + attempt % 3, '.')}` : 'Connecter'}
              </button>
              {connecting && attempt > 0 && <button onClick={() => disconnect(client)}>Annuler</button>}
            </div>
          }
        </div>
      </header>
    </div>
  )
}

export default Client
