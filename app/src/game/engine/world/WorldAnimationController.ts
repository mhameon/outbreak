import type { DebugGUI } from '../Debug'
import { App } from '../Engine'
import { World } from './World'

export class WorldAnimationController {
  readonly world: World
  #debug?: DebugGUI
  #pausedElapsedTime: number = 0

  constructor (world: World) {
    this.world = world
    this.#setDebug()
  }

  #setDebug () {
    this.#debug = App().debug.addFolder(this)

    const vcr = {
      run: () => {
        this.run()
        button.run?.disable()
        button.pause?.enable()
      },
      pause: () => {
        this.pause()
        button.run?.enable()
        button.pause?.disable()
      }
    }

    const button = {
      run: this.#debug?.add(vcr, 'run'),
      pause: this.#debug?.add(vcr, 'pause')
    }
    button[App().clock.running ? 'pause' : 'run']?.disable()
  }

  run () {
    this.world.registerAnimations()

    App().clock.start()
    App().clock.elapsedTime = this.#pausedElapsedTime
  }

  pause () {
    this.#pausedElapsedTime = App().clock.elapsedTime
    App().clock.stop()
  }

  destroy () {
    this.#debug?.destroy()
  }

}
