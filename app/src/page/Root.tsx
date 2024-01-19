import React from 'react'
import { Container } from 'react-bootstrap'
import { ErrorBoundary } from '../component/common/ErrorBoundary'
import { NavigationBar } from '../component/navigationBar'
import { Outlet } from 'react-router-dom'

export const Root = () => {
  return <ErrorBoundary>
    <NavigationBar/>
    <Container>
      <Outlet/>
    </Container>
  </ErrorBoundary>
}
