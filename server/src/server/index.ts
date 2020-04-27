import middleware from './middleware'
import Server from './server'
import GameEngine from '@engine/GameEngine'

const server = new Server(new GameEngine())

server.express.use(middleware.router)

export default server
