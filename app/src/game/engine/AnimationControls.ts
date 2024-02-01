import { Core } from './Core'
import type { DebugGUI } from './Debug'
import type { Destroyable } from './interface/Destroyable'
import { World } from './World'

export class AnimationControls extends Core implements Destroyable {
  readonly world: World
  #debugPanel?: DebugGUI
  #pausedElapsedTime: number = 0

  constructor (world: World) {
    super()
    this.world = world
    this.#setDebugPanel()
  }

  #setDebugPanel () {
    this.#debugPanel = this.debug.addFolder(this)

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
      run: this.#debugPanel?.add(vcr, 'run'),
      pause: this.#debugPanel?.add(vcr, 'pause')
    }
    button[this.clock.running ? 'pause' : 'run']?.disable()
  }

  run () {
    this.world.registerAnimations()

    this.clock.start()
    this.clock.elapsedTime = this.#pausedElapsedTime
    this.camera.controls.enabled = true
    this.renderer.instance.setAnimationLoop(() => this.renderer.tick())
  }

  pause () {
    this.#pausedElapsedTime = this.clock.elapsedTime
    this.clock.stop()
    this.camera.controls.enabled = false
    this.renderer.instance.setAnimationLoop(null)
  }

  destroy () {
    this.#debugPanel?.destroy()
  }

}
