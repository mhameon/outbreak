import Button from 'react-bootstrap/Button'
import React, { useContext } from 'react'
import { SocketContext, ServerConnectionStatus } from '../../context/SocketContext'
import { config } from '../../config'

interface ConnectionButtonProps {
}

export function ConnectionButton (props: ConnectionButtonProps) {
  const { socketState, dispatchSocketState } = useContext(SocketContext)

  const attempt = socketState.connection.attempt

  switch (socketState.connection.status) {
    case ServerConnectionStatus.connected:
      return <Button
        variant="danger"
        onClick={disconnect}>
        Déconnecter
      </Button>

    case ServerConnectionStatus.connecting:
      return <Button
        variant="primary"
        onClick={disconnect}>
        Connexion...
        {attempt !== undefined ? `${attempt}/${config.socket.options.reconnectionAttempts}` : ''}
      </Button>

    default:
    case ServerConnectionStatus.disconnected:
      return <Button
        variant="primary"
        onClick={connect}>
        Connecter
      </Button>
  }

  function connect () {
    dispatchSocketState({ type: 'server:connect' })
  }

  function disconnect () {
    dispatchSocketState({ type: 'server:disconnect' })
  }
}
