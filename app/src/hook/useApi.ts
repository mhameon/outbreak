import { useState, useRef } from 'react'
import axios, { Method as HttpMethod, CanceledError } from 'axios'
import { config } from '../config'

const api = axios.create({
  withCredentials: true,
  baseURL: `${new URL('api', config.server.host)}`
})

export const useApi = () => {
  const [ response, setResponse ] = useState<any>(null)
  const [ error, setError ] = useState('')
  const [ loading, setLoading ] = useState(false)
  const controllerRef = useRef(new AbortController())

  function abort () {
    controllerRef.current.abort()
  }

  async function query<T = any> (method: HttpMethod, url: string, payload?: Record<string, unknown>): Promise<T | undefined> {
    setLoading(true)
    setError('')
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
      } else if (error instanceof Error) {
        setError(error.message)
        console.error(error)
      }
    } finally {
      setLoading(false)
    }
  }

  async function get<T> (url: string, payload?: Record<string, unknown>) {
    return query<T>('get', url, payload)
  }

  async function post<T> (url: string, payload?: Record<string, unknown>) {
    return query<T>('post', url, payload)
  }

  return { abort, response, error, loading, get, post }
}
