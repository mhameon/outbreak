import { GUI as DebugGUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import Stats from 'three/examples/jsm/libs/stats.module'
import type { Destroyable } from './interface/Destroyable'
import { isObject } from './utils/object'

export { DebugGUI }

export class Debug implements Destroyable {
  gui?: DebugGUI
  #stats?: Stats
  static readonly enabled = process.env.NODE_ENV === 'development'

  constructor () {
    if (Debug.enabled) {
      this.gui = new DebugGUI()

      this.#stats = new Stats()
      this.#stats.showPanel(0)
      this.#stats.dom.className = 'stats-js'
      document.body.appendChild(this.#stats.dom)
    }
  }

  get enabled () {
    return Debug.enabled
  }

  get stats (): Stats | undefined {
    return this.#stats
  }

  addFolder (label?: string | Object): DebugGUI | undefined {
    if (this.gui) {
      return this.gui.addFolder(
        typeof label === 'string' ? label : isObject(label) ? label.constructor.name : 'Folder'
      )
    }
  }

  destroy () {
    if (this.gui) {
      this.gui.destroy()
      this.gui = undefined
    }
    if (this.#stats?.dom) {
      document.body.removeChild(this.#stats.dom)
      this.#stats = undefined
    }
  }
}
