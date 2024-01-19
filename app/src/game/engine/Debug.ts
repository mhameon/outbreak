import { GUI as DebugGUI } from 'three/examples/jsm/libs/lil-gui.module.min'
import Stats from 'three/examples/jsm/libs/stats.module'
import { isObject } from './utils'

export { DebugGUI }

export class Debug {
  gui?: DebugGUI
  readonly stats?: Stats
  readonly enabled = process.env.NODE_ENV === 'development'

  constructor () {
    if (this.enabled) {
      this.gui = new DebugGUI()

      this.stats = new Stats()
      this.stats.showPanel(0)
      document.body.appendChild(this.stats.dom)
      this.stats.dom.className = 'stats-js'
    }
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
    }
    if (this.stats?.dom) {
      document.body.removeChild(this.stats.dom)
    }
  }
}
