import type { SessionData } from 'express-session'
import type { ClientSessionData } from '#shared/types'

export function buildClientSession (session: SessionData): ClientSessionData {
  return {
    name: session.user.name
  }
}

export { login } from './login'
export { logout } from './logout'
export { session } from './session'
