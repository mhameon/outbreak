import { useParams } from 'react-router-dom'
import { Game } from '../game'
import { SocketInfos } from './socketInfos'
import { ConnectionButton } from './connectionButton'
import React from 'react'
import { SocketProvider } from '../../context/provider/SocketProvider'
import { GameSelector } from './gameSelector'

export interface ClientProps {
}

export function Client (props: ClientProps) {
  const params = useParams()

  return (
    <SocketProvider>
      <Game/>
      <div className="webgl-overlay">
        <h1>Gaming client</h1>
        <SocketInfos/>
        <GameSelector game={params.game}/>
        <ConnectionButton/>
      </div>

    </SocketProvider>
  )
}
