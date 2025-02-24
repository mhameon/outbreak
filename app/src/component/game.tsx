import React, { useRef, useEffect } from 'react'
import { App } from '../game/engine/Engine'
import { World } from '../game/World'

export const Game: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (canvas) {
      const app = App(canvas).build(new World())
      app.animations.run()

      const handler = (e: Event) => {
        console.log(e)
        app.world.onEvent(e)
      }
      document.addEventListener('game:state', handler)

      return () => {
        // Fixme document.removeEventListener don't work
        document.removeEventListener('game:state', handler)
        app.destroy()
      }
    }
  }, [])

  return <canvas
    ref={canvasRef}
    id="webgl"
    // onClick={() => {
    //   try {
    //     App().destroy()
    //   } catch (e) {
    //     if (canvasRef.current) {
    //       const app = App(canvasRef.current).build(new World())
    //       app.animations.run()
    //     }
    //   }
    // }}
  />
}
