import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import { SessionProvider } from './context/provider/SessionProvider'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    <SessionProvider>
      <BrowserRouter>
        <App/>
      </BrowserRouter>
    </SessionProvider>
  </React.StrictMode>
)
