import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import NavDropdown from 'react-bootstrap/NavDropdown'
import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { SessionContext } from '../context/SessionContext'
import { Container } from 'react-bootstrap'

export function NavigationBar () {
  const { session } = useContext(SessionContext)

  return <Navbar
    collapseOnSelect
    bg="dark"
    expand="md"
    variant="dark">
    <Container>
      <Navbar.Brand
        as={Link}
        to="/">🧟</Navbar.Brand>
      <Navbar.Toggle aria-controls="responsive-navbar-nav"/>
      <Navbar.Collapse id="responsive-navbar-nav">
        <Nav activeKey="home">
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
    </Container>
  </Navbar>
}
