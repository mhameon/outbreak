import Welcome from './pages/Welcome'
import Client from "./Client";
import { Router, Link } from '@reach/router'
import React from "react";

function App (): JSX.Element{
  return (
    <div>
      <nav>
        <Link to="/">Home</Link>
        &nbsp;
        <Link to="client">Client</Link>
      </nav>
      <Router>
        <Welcome path="/"/>
        <Client path="client"/>
      </Router>
    </div>
  )
}

export default App
