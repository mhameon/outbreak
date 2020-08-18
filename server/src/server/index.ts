import middleware from './middleware'
import Server from './server'
import GameManager from '@engine/game/GameManager'

const server = new Server(new GameManager())

server.express.use(middleware.router)

export default server
