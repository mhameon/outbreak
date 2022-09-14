import React, { useState, useContext } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { config } from '../config'
import axios from 'axios'
import { SessionContext } from '../context/SessionContext'

const zombieHeroes = [
  'Rick Grimes', 'Michonne', 'Glenn', 'Negan', // The Walking Dead
  'Tallahassee', 'Columbus', 'Wichita', 'Little Rock', // Zombieland
  'Shaun', 'Ed', // Shaun of the dead
  'Ash Williams', // Evil Dead
  'Lionel Cosgrove', // Braindead
  'Robert Neville', // I Am Legend
]
const randomZombieHero = zombieHeroes[Math.floor(Math.random() * zombieHeroes.length)]

const defaultFormValue = {
  login: '',
}

export function Login () {
  const { session, setSession } = useContext(SessionContext)
  const [ formData, setFormData ] = useState(defaultFormValue)
  const navigate = useNavigate()
  const location = useLocation()

  const onSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    // const data = new FormData(event.target as any)
    // console.log(data)
    // console.log(Object.fromEntries(data))

    axios.post(config.server.host + '/login', formData, { withCredentials: true })
      .then(res => {
        console.log(res)

        setSession!({ name: formData.login, isAuthenticated: true })

        navigate('/play')
        setFormData(defaultFormValue)
      })
      .catch(err => console.warn(err))
  }

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target
    const isCheckbox = type === 'checkbox'

    setFormData({
      ...formData,
      [name]: isCheckbox ? event.target.checked : value,
    })
  }

  return (
    <form onSubmit={onSubmit}>
      <pre>{JSON.stringify(location)}</pre>
      <fieldset>
        Nom
        <input
          name="login"
          placeholder={randomZombieHero}
          type="text"
          value={formData.login}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </fieldset>
    </form>
  )
}
