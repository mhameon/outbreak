import 'module-alias/register'
import config from 'config'
import server from './server'

const port = config.get('server.port') as number
server.listen(port)
