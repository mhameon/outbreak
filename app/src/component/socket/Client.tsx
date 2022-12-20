import { SocketInfos } from './SocketInfos'
import { ConnectionButton } from './ConnectionButton'
import React from 'react'
import { SocketProvider } from '../../context/provider/SocketProvider'

export interface ClientProps {
}

export function Client (props: ClientProps) {

  return <SocketProvider>
    <h1>Gaming client</h1>
    <SocketInfos/>
    <ConnectionButton/>
  </SocketProvider>
}
