import React, { useContext, useState } from 'react'
import { SocketContext, isConnected } from '../../context/SocketContext'
import type { GameId, Game } from '#shared/types'
import Button from 'react-bootstrap/Button'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'

interface GameSelectorProps {
}

export const GameSelector: React.FC<GameSelectorProps> = (props) => {
  const context = useContext(SocketContext)
  const [ requestGame, setRequestGame ] = useState<Game>()
  console.log(requestGame)

  return <>
    {
      isConnected(context.socketState.connection) && <div>
        <InputGroup>
          <Form.Select
            value={requestGame?.id}
            onChange={(e) => {
              setRequestGame(context.socketState.lobby?.games?.find(g => g.id === e.target.value))
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
