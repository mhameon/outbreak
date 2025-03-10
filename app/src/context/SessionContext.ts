import { createContext } from 'react'
import type { ClientSessionData } from '#shared/types'

export interface SessionData extends ClientSessionData {
  isAuthenticated: boolean
}

export type SessionContext = {
  get: SessionData
  set: (session: SessionData) => void
  logout: () => Promise<void>
}

export const defaultSessionContext: { get: SessionData } = {
  get: {
    name: 'Unknown',
    isAuthenticated: false
  },
}

export const Session = createContext<SessionContext>(defaultSessionContext as any)
