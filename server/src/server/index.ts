import middleware from './middleware'
import GameServer from './GameServer'
import GameManager from '@engine/game/GameManager'

const server = new GameServer(new GameManager())

server.express.use(middleware.router)

export default server
