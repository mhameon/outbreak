import React, { useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SessionContext } from '../context/SessionContext'
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
  const { session, setSession } = useContext(SessionContext)
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const data: { login: string } = Object.fromEntries(
      new FormData(event.currentTarget) as Iterable<[ string ]>
    )
    console.log(data)

    try {
      const res = await api.post<{ name: string }>('/login', data)
      setSession!({ name: res.name })
      //navigate('/play')
    } catch (e) {
      console.warn(e)
    }
  }
  return <form onSubmit={onSubmit}>
    {api.loading ? 'Loading....' : ''}
    <pre>{JSON.stringify(location)}</pre>
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
    </fieldset>
  </form>
}
