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

export const useApi = () => {
  const [ response, setResponse ] = useState<any>(null)
  const [ error, setError ] = useState<NetworkError | null>(null)
  const [ loading, setLoading ] = useState(false)
  const controllerRef = useRef(new AbortController())

  function abort () {
    controllerRef.current.abort()
  }

  async function query<T = any> (method: HttpMethod, url: string, payload?: Record<string, unknown>, throws = false): Promise<T | undefined> {
    setLoading(true)
    setError(null)
    setResponse(null)
    try {
      const response = await api.request<T>({
        url,
        method,
        data: payload,
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
      if (throws) {
        throw error
      }
    } finally {
      setLoading(false)
    }
  }

  async function get<T> (url: string, payload?: Record<string, unknown>, throws = false) {
    return query<T>('get', url, payload, throws)
  }

  async function post<T> (url: string, payload?: Record<string, unknown>, throws = false) {
    return query<T>('post', url, payload, throws)
  }

  return { abort, response, error, loading, get, post }
}
