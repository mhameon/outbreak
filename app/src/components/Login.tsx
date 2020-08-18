import React, { SyntheticEvent, useState } from 'react'

const zombieHeroes = [
  'Rick Grimes', 'Michonne', 'Glenn', 'Negan', // The Walking Dead
  'Tallahassee', 'Columbus', 'Wichita', 'Little Rock', // Zombieland
  'Shaun', 'Ed', // Shaun of the dead
  'Ash Williams', // Evil Dead
  'Lionel Cosgrove', // Braindead
  'Robert Neville', // I Am Legend
]
const randomZombieHero = zombieHeroes[Math.floor(Math.random() * zombieHeroes.length)]

function Login (): JSX.Element {
  const [ login, setLogin ] = useState('')


  function onLogin (e: SyntheticEvent) {
    e.preventDefault()
    alert('input='+login)
  }

  return (
    <form>
      <fieldset>
        Nom
        <input
          name="login"
          placeholder={randomZombieHero}
          type="text"
          onChange={e => setLogin(e.target.value)}/>
        <button onClick={onLogin}>Ok</button>
      </fieldset>
    </form>
  )
}

export default Login
