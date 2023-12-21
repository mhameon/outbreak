import { SocketInfos } from './socketInfos'
import { ConnectionButton } from './connectionButton'
import React from 'react'
import { SocketProvider } from '../../context/provider/SocketProvider'
import { GameSelector } from './gameSelector'

export interface ClientProps {
}

export function Client (props: ClientProps) {
  return (
    <SocketProvider>
      <h1>Gaming client</h1>
      <SocketInfos/>
      <GameSelector/>
      <ConnectionButton/>
    </SocketProvider>
  )
}
