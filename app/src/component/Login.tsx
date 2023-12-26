import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { Session, type SessionData } from '../context/SessionContext'
import { useApi } from '../hook/useApi'

const zombieHeroes = [
  'Rick Grimes', 'Michonne', 'Glenn', 'Negan', // The Walking Dead
  'Tallahassee', 'Columbus', 'Wichita', 'Little Rock', // Zombieland
  'Shaun', 'Ed', // Shaun of the dead
  'Ash Williams', // Evil Dead
  'Lionel Cosgrove', // Braindead
  'Robert Neville', // I Am Legend
]
const randomZombieHero = zombieHeroes[Math.floor(Math.random() * zombieHeroes.length)]

export function Login () {
  const api = useApi()
  const session = useContext(Session)
  const navigate = useNavigate()

  async function onSubmit (event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const data = Object.fromEntries(new FormData(event.currentTarget))
    console.log(data)

    const sessionData = await api.post<SessionData>('/login', data)
    if (sessionData) {
      session.set(sessionData)
      navigate('/play')
    }
  }

  return <form onSubmit={onSubmit}>
    {api.loading ? 'Loading....' : ''}
    <fieldset>
      Nom
      <input
        name="login"
        placeholder={randomZombieHero}
        type="text"
        // value={formData.login}
        // onChange={handleChange}
      />
      <button type="submit">Submit</button>
      {!!api.error && <p>{api.error.message} ({api.error.code ?? 'unknown error'})</p>}
    </fieldset>
  </form>
}
