import {
  useEffect,
  useRef,
} from 'react'

import axios from 'axios'
import useAuth from './useAuth'

const apiUrl =
  import.meta.env.VITE_API_BASE_URL

const useAxiosPrivate = () => {
  const { setAuth } = useAuth()

  const axiosRef = useRef(null)

  const isRefreshing =
    useRef(false)

  const failedQueue =
    useRef([])

  if (!axiosRef.current) {
    axiosRef.current = axios.create({
      baseURL: apiUrl,

      headers: {
        'Content-Type':
          'application/json',
      },

      withCredentials: true,
    })
  }

  useEffect(() => {
    const axiosAuth =
      axiosRef.current

    const processQueue = (error) => {
      failedQueue.current.forEach(
        ({ resolve, reject }) => {
          if (error) {
            reject(error)
          } else {
            resolve()
          }
        },
      )

      failedQueue.current = []
    }

    const interceptorId =
      axiosAuth.interceptors.response.use(
        (response) => response,

        async (error) => {
          const originalRequest =
            error.config

          const status =
            error.response?.status

          const url =
            originalRequest?.url || ''

          if (
            !originalRequest ||
            status !== 401
          ) {
            return Promise.reject(error)
          }

          if (url.includes('/refresh')) {
            return Promise.reject(error)
          }

          if (originalRequest._retry) {
            return Promise.reject(error)
          }

          if (isRefreshing.current) {
            return new Promise(
              (resolve, reject) => {
                failedQueue.current.push({
                  resolve,
                  reject,
                })
              },
            ).then(() =>
              axiosAuth(
                originalRequest,
              ),
            )
          }

          originalRequest._retry = true

          isRefreshing.current = true

          try {
            await axiosAuth.post(
              '/refresh',
            )

            processQueue(null)

            return axiosAuth(
              originalRequest,
            )
          } catch (refreshError) {
            processQueue(refreshError)

            setAuth(null)

            return Promise.reject(
              refreshError,
            )
          } finally {
            isRefreshing.current =
              false
          }
        },
      )

    return () => {
      axiosAuth.interceptors.response.eject(
        interceptorId,
      )
    }
  }, [setAuth])

  return axiosRef.current
}

export default useAxiosPrivate