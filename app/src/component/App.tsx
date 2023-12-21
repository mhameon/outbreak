import React, { PropsWithChildren, useEffect, useContext } from 'react'
import { Session, type SessionData } from '../context/SessionContext'
import { useApi } from 'hook/useApi'

interface AppProps extends PropsWithChildren {
}

export const App: React.FC<AppProps> = ({ children, ...props }) => {
  const session = useContext(Session)
  const api = useApi()

  useEffect(() => {
    api.get<SessionData>('session').then(data => {
      if (data) {
        session.set(data)
      }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return <>
    {children}
  </>
}
