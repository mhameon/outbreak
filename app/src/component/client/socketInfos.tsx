import { Session } from '../../context/SessionContext'
import { SocketContext, ServerConnectionStatus } from '../../context/SocketContext'
import { config } from '../../config'
import React, { useContext } from 'react'

export interface SocketInfosProps {
}

export function SocketInfos (props: SocketInfosProps) {
  const session = useContext(Session)
  const { socketState: { socket, connection } } = useContext(SocketContext)

  return <>
    <h2>Socket IO Information:</h2>
    <p>
      Status: <strong>{connection.status !== undefined ? ServerConnectionStatus[connection.status] : 'Unknown'}</strong>
      &nbsp;{connection.attempt !== undefined ? `${connection.attempt}/${config.ws.options.reconnectionAttempts}` : ''}<br/>
      Socket ID: <strong>{socket?.id}</strong><br/>
      Room: <strong>{session.get.room}</strong>
    </p>
  </>
}
