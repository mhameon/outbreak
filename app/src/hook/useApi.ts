import { useState, useRef } from 'react'
import axios, { Method as HttpMethod, CanceledError, AxiosError } from 'axios'
import { config } from '../config'

type NetworkError = {
  /** Error name */
  code?: string
  /** HTTP code */
  status?: number
  /** Error description */
  message: string
}

const api = axios.create({
  withCredentials: true,
  baseURL: `${new URL(config.http.pathname, `${window.location.protocol}//${window.location.hostname}:${config.http.port}`)}`,
})

type Payload = Record<string, unknown>

type Option = {
  throws: boolean
}

const defaultOptions = { throws: false }

export const useApi = () => {
  const [ response, setResponse ] = useState<any>(null)
  const [ error, setError ] = useState<NetworkError | null>(null)
  const [ loading, setLoading ] = useState(false)
  const controllerRef = useRef(new AbortController())

  function abort () {
    controllerRef.current.abort()
  }

  async function query<T = any> (method: HttpMethod, url: string, body?: Payload, option: Option = defaultOptions): Promise<T | undefined> {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const response = await api.request<T>({
        url,
        method,
        ...(method === 'GET' ? { params: body } : { data: body }),
        signal: controllerRef.current.signal
      })
      setResponse(response.data)
      return response.data
    } catch (error) {
      if (error instanceof CanceledError) {
        console.log('HTTP request aborted...')
      } else if (error instanceof AxiosError) {
        const err = { code: error.code, message: error.message, status: error.response?.status }
        setError(err)
        console.error(error)
      } else if (error instanceof Error) {
        const err = { message: error.message || 'Error' }
        setError(err)
        console.error(error)
      }
      if (option.throws) {
        throw error
      }
    } finally {
      setLoading(false)
    }
  }

  /**
   * ```
   * get('users', { id: 123 })
   * ```
   * Send `GET` request to `api/users?id=123`
   */
  async function get<T> (url: string, params?: Payload, option: Option = defaultOptions) {
    return query<T>('get', url, params, option)
  }

  /**
   * ```
   * post('users', { email: user@example.com })
   * ```
   * Send `POST` request to `api/users` with `{ email: user@example.com }` as body
   */
  async function post<T> (url: string, body?: Payload, option: Option = defaultOptions) {
    return query<T>('post', url, body, option)
  }

  return { abort, response, error, loading, get, post }
}
