/// <reference types="react-scripts" />

/// <reference types="./game/engine/engine" />

import type { GameState } from '#shared/types'

interface GlobalEventHandlersEventMap {
  'game:state': CustomEvent<GameState>
}
