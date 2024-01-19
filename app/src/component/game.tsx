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

      return () => {
        App().destroy()
      }
    }
  }, [])

  return <canvas
    ref={canvasRef}
    id="webgl"
  />
}
