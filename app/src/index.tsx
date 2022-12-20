import React from 'react'
import ReactDOM from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import { RouterProvider } from 'react-router-dom'
import { SessionProvider } from './context/provider/SessionProvider'
import { router } from './router'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
)
root.render(
  <React.StrictMode>
    <SessionProvider>
      <RouterProvider router={router}/>
    </SessionProvider>
  </React.StrictMode>
)
