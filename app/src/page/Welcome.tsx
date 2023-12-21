import React, { useContext } from 'react'
import { Login } from '../component/Login'
import { Session } from '../context/SessionContext'

export function Welcome () {
  const { get: user } = useContext(Session)

  if (user.isAuthenticated) {
    return <>
      <h1>Welcome {user.name} !</h1>
    </>
  }

  return <>
    <h1>Please, login</h1>
    <Login/>
  </>
}
