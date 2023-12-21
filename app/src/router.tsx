import { createBrowserRouter } from 'react-router-dom'
import { Root } from './page/Root'
import { Welcome } from './page/Welcome'
import { Client } from './component/client/index'
import React from 'react'
import { Settings } from './page/Settings'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Root/>,
    children: [
      {
        index: true,
        element: <Welcome/>
      },
      {
        path: 'play',
        element: <Client/>
      },
      {
        path: 'settings',
        element: <Settings/>
      }
    ]
  },
])
