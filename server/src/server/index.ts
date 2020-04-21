import middleware from '../middleware'
import Server from './server'

const server = new Server()

middleware.addRoutes(server.getExpressApp())

export default server
