import React from 'react'
import { NavigationBar } from './component/NavigationBar'

export interface ApplicationProps {
}

const Application: React.FunctionComponent<ApplicationProps> = () => {
  return <NavigationBar></NavigationBar>
  // return <div>
  //   <Navbar></Navbar>
  //   <nav>
  //     <Link to="/">Home</Link>
  //     &nbsp;
  //     <Link to="play">Client</Link>
  //
  //   </nav>
  //
  //   <Routes>
  //     <Route
  //       element={<Welcome/>}
  //       path="/"/>
  //     <Route
  //       element={<Client/>}
  //       path="/play"/>
  //   </Routes>
  // </div>
}

export default Application
