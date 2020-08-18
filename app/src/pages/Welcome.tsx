import React from 'react'
import Login from "../components/Login";
import { RouteComponentProps } from "@reach/router";

function Welcome (props: RouteComponentProps): JSX.Element {
  return (
    <div>
      <h1>Welcome screen</h1>
      <Login/>
    </div>
  )
}

export default Welcome
