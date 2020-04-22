import middleware from '../middleware'
import Server from './server'

const server = new Server()

// server.register(new GameEngine())

server.express.use(middleware.router)

export default server
