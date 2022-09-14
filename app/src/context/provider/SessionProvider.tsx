import React, { PropsWithChildren, useState, useReducer, useEffect, useContext, useMemo } from 'react'
import { SessionContext, defaultSessionContextState, Session, SessionContextProps } from '../SessionContext'


export const SessionProvider = ({ children }: PropsWithChildren) => {
  const [ { session }, setSession ] = useState(defaultSessionContextState)

  const userSession: SessionContextProps = {
    session: { ...session },
    setSession: (session: Session) => {
      setSession({ session })
    }
  }

  //const value = useMemo(() => ({ session, setSession: initSession }), [ session, setSession ])

  return <SessionContext.Provider value={userSession}>
    {children}
  </SessionContext.Provider>
}
