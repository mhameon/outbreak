import 'module-alias/register'
import config from 'config'
import server from './server'
import { cli as runCommandLineInterpreter, getLogger } from './service'

getLogger().info('Server is starting...', 'test')

runCommandLineInterpreter(config.get('cli.enabled'))

const port = config.get('server.port') as number
server.listen(port)
