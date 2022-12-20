import React, { PropsWithChildren, useState } from 'react'
import { SessionContext, defaultSessionContextState, Session, SessionContextProps } from '../SessionContext'


export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [ { session }, setSession ] = useState(defaultSessionContextState)

  const userSession: SessionContextProps = {
    session: { ...session },
    setSession: (session: Session | void) => {
      if (session) {
        session.isAuthenticated = true
        setSession({ session })
        return
      }
      setSession(defaultSessionContextState)
    }
  }

  //const value = useMemo(() => ({ session, setSession: initSession }), [ session, setSession ])

  return <SessionContext.Provider value={userSession}>
    {children}
  </SessionContext.Provider>
}
