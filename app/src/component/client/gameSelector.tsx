import React, { useCallback, useContext, useEffect, useState } from 'react'
//import { isGameId } from '#shared/guards'
import { SocketContext, isConnected } from '../../context/SocketContext'
import type { GameId, Game } from '#shared/types'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

interface GameSelectorProps {
  game?: string
}

//fixme #shared/guard not visible :(
function isGameId (name: unknown): name is GameId {
  return typeof name === 'string' && name.startsWith('game_')
}


export const GameSelector: React.FC<GameSelectorProps> = (props) => {
  const context = useContext(SocketContext)
  const [ requestGame, setRequestGame ] = useState<Game>()

  const setGame = useCallback((id: GameId) => {
    setRequestGame(context.socketState.lobby?.games?.find(g => g.id === id))
  }, [ context ])

  useEffect(() => {
    if (isGameId(props.game)) {
      setGame(props.game)
    }
  }, [ props.game, setGame ])

  return <>
    {
      isConnected(context.socketState.connection) && <div>
        <InputGroup>
          <Form.Select
            name="GameSelector"
            value={requestGame?.id}
            onChange={(e) => {
              setGame(e.target.value as GameId)
            }}>
            <option
              value="">
              {context.socketState.lobby?.games?.length} games available, please choose one...
            </option>
            {context.socketState.lobby?.games?.map(game => (
              <option
                key={game.id}
                value={game.id}>
                {game.id} {game.name} ({game.players})
              </option>
            ))}
          </Form.Select>
          <Button
            disabled={!requestGame}
            onClick={() => {
              if (confirm(`Join ${requestGame?.id} ?`)) {
                context.dispatchSocketState({ type: 'player:join:game', requestGameId: requestGame?.id as GameId })
              }
            }}>Join
          </Button>
        </InputGroup>
      </div>
    }
  </>
}
