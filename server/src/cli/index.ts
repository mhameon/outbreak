#!/usr/bin/env node
import io from 'socket.io-client'

const socket = io('http://localhost:8080')
console.log(socket)
socket.on('connect', () => {
  console.log(socket)

  // process.on('SIGINT', (signal: NodeJS.Signals): void => {
  //   socket.disconnect()
  // })
})
