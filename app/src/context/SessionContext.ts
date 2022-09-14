import { createContext } from 'react'

export type Session = {
  name: string
  isAuthenticated: boolean
}

export interface SessionContextProps {
  session: Session
  setSession?: (session: Session) => void
}

export const defaultSessionContextState: SessionContextProps = {
  session: {
    name: 'Unknown',
    isAuthenticated: false
  }
}

export const SessionContext = createContext<SessionContextProps>(defaultSessionContextState)
