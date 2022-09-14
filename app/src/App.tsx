import React from 'react'
import { Container } from 'react-bootstrap'
import { Route, Routes } from 'react-router-dom'
import { NavigationBar } from './component/NavigationBar'
import { Client } from './component/socket/Client'
import { Welcome } from './page/Welcome'

export interface ApplicationProps {
}

const Application: React.FunctionComponent<ApplicationProps> = () => {
  return <>
    <NavigationBar></NavigationBar>
    <Container>
      <Routes>
        <Route
          element={<Welcome/>}
          path="/"
        />
        <Route
          element={<Client/>}
          path="/play"
        />
      </Routes>
    </Container>
  </>

}

export default Application
