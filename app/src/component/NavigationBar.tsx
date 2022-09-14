import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import React, { useContext } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { Welcome } from '../page/Welcome'
import { Client } from './socket/Client'
import { SessionContext } from '../context/SessionContext'
import { Container } from 'react-bootstrap'

export function NavigationBar () {
  const { session } = useContext(SessionContext)

  return <><Navbar>
    <Navbar.Collapse>
      <Nav activeKey="home">
        <Nav.Item>
          <Nav.Link
            as={Link}
            eventKey="home"
            to="/">
            Home
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link
            as={Link}
            eventKey="play"
            to="play">
            Jouer !
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
        </Nav.Item>
      </Nav>
      <Nav>
        {session.isAuthenticated
          ? <NavDropdown
            id="nav-dropdown"
            title={session.name}>
            <NavDropdown.Item eventKey="settings">Settings</NavDropdown.Item>
            <NavDropdown.Divider/>
            <NavDropdown.Item eventKey="logout">Logout</NavDropdown.Item>
          </NavDropdown>
          : <Nav.Item>
            <Nav.Link eventKey="register">
              Register
            </Nav.Link>
          </Nav.Item>}
      </Nav>
    </Navbar.Collapse>
  </Navbar>

    <Routes>
      <Route
        element={<Welcome/>}
        path="/"/>
      <Route
        element={<Client/>}
        path="/play"/>
    </Routes>
  </>
}
