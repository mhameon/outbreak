import { SocketContext, ServerConnectionStatus } from '../../context/SocketContext'
import { config } from '../../config'
import React, { useContext } from 'react'

export interface SocketInfosProps {
}

export function SocketInfos (props: SocketInfosProps) {
  const { socketState: { socket, connection }, dispatchSocketState } = useContext(SocketContext)

  return <>
    <h2>Socket IO Information:</h2>
    <p>
      Status: <strong>{connection.status !== undefined ? ServerConnectionStatus[connection.status] : 'Unknown'}</strong>
      &nbsp;{connection.attempt !== undefined ? `${connection.attempt}/${config.socket.options.reconnectionAttempts}` : ''}<br/>
      Socket ID: <strong>{socket?.id}</strong><br/>
      Room: <strong>{connection.room}</strong>
    </p>
  </>
}
