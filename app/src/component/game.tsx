import React, { useRef, useEffect } from 'react'
import { App } from '../game/engine/Engine'
import { World } from '../game/World'

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (canvasRef.current) {
      App(canvasRef.current)
        .build(new World())
        .world.animations.run()

      document.addEventListener('game:state', App().world.onEvent)

      return () => {
        // Fixme document.removeEventListener don't work
        document.removeEventListener('game:state', App().world.onEvent)

        App().destroy()
      }
    }
  }, [])

  return <canvas
    ref={canvasRef}
    id="webgl"
  />
}
