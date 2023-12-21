import React, { PropsWithChildren, useState } from 'react'
import { Session, defaultSessionContextState, SessionData, SessionContext } from '../SessionContext'
import { useLocalStorage } from 'usehooks-ts'
import { useApi } from '../../hook/useApi'

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [ localSessionStorage, setLocalSessionStorage ] = useLocalStorage<SessionData | undefined>('session', undefined)
  const [ session, setSession ] = useState(localSessionStorage ? { get: localSessionStorage } : defaultSessionContextState)
  const api = useApi()

  const context: SessionContext = {
    get: session.get,
    set: (session: SessionData) => {
      session.isAuthenticated = true
      setSession({ get: session })
      setLocalSessionStorage(session)
    },
    logout: async () => {
      setSession(defaultSessionContextState)
      setLocalSessionStorage(undefined)
      await api.post('/logout')
    }
  }

  return <Session.Provider value={context}>
    {children}
  </Session.Provider>
}
