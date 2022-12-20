import React from 'react'
import { Container } from 'react-bootstrap'
import { NavigationBar } from '../component/NavigationBar'
import { Outlet } from 'react-router-dom'

export const Root = () => {
  return <>
    <NavigationBar/>
    <Container>
      <Outlet/>
    </Container>
  </>
}
