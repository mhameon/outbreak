import 'module-alias/register'
import config from 'config'
import server from './server'

server.listen(config.get('server.port'))
