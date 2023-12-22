import React, { PropsWithChildren, useState, useEffect, useMemo } from 'react'
import { Session, defaultSessionContextState, SessionData, SessionContext } from '../SessionContext'
import { useLocalStorage } from 'usehooks-ts'
import { useApi } from '../../hook/useApi'

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [ localSessionStorage, setLocalSessionStorage ] = useLocalStorage<SessionData | undefined>('session', undefined)
  const [ session, setSession ] = useState(localSessionStorage ? { get: localSessionStorage } : defaultSessionContextState)
  const { get, post } = useApi()

  const context = useMemo<SessionContext>(() => ({
    get: session.get,
    set: (session: SessionData) => {
      session.isAuthenticated = true
      setSession({ get: session })
      setLocalSessionStorage(session)
    },
    logout: async () => {
      setSession(defaultSessionContextState)
      setLocalSessionStorage(undefined)
      await post('/logout')
    }
  }), [ session.get ])

  useEffect(() => {
    get<SessionData>('/session', {}, true)
      .then(data => {
        if (data) {
          context.set(data)
        }
      })
      .catch(e => {
        if (e.code === 'ERR_NETWORK' || e.status === 401) {
          setSession(defaultSessionContextState)
          setLocalSessionStorage(undefined)
        }
      })
  }, [])

  return <Session.Provider value={context}>
    {children}
  </Session.Provider>
}
