import React, { PropsWithChildren, useState, useEffect, useMemo } from 'react'
import { Session, defaultSessionContext, SessionData, SessionContext } from '../SessionContext'
import { useLocalStorage } from 'usehooks-ts'
import { useApi } from '../../hook/useApi'

export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [ localSessionStorage, setLocalSessionStorage ] = useLocalStorage<SessionData | undefined>('session', undefined)
  const [ session, setSession ] = useState(localSessionStorage ? { get: localSessionStorage } : defaultSessionContext)
  const { get, post } = useApi()

  const context = useMemo<SessionContext>(() => ({
    get: session.get,
    set: (session: SessionData) => {
      session.isAuthenticated = true
      setSession({ get: session })
      setLocalSessionStorage(session)
    },
    logout: async () => {
      setSession(defaultSessionContext)
      setLocalSessionStorage(undefined)
      await post('/logout')
    }
  }), [ session.get ])

  useEffect(() => {
    get<SessionData>('/session', {}, { throws: true })
      .then(data => {
        if (data) {
          context.set(data)
        }
      })
      .catch(e => {
        if (e.code === 'ERR_NETWORK' || e.response?.status === 401) {
          setSession(defaultSessionContext)
          setLocalSessionStorage(undefined)
          // TODO error toast
        }
      })
  }, [])

  return <Session.Provider value={context}>
    {children}
  </Session.Provider>
}
