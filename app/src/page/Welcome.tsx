import React, { useContext } from 'react'
import { Login } from '../component/Login'
import { SessionContext } from '../context/SessionContext'

export function Welcome () {
  const { session: user } = useContext(SessionContext)

  if (user.isAuthenticated) {
    return <>
      <h1>Welcome {user.name} !</h1>
    </>
  }

  return <>
    <h1>Welcome screen</h1>
    <Login/>
  </>
}
