import { useState, useEffect } from 'react'
import { ArgumentTypes, IpcClient, ServiceMap } from '../protocols'

export function useIpc<T extends ServiceMap = any, K extends keyof(T) = any>
  (ipc: IpcClient<T>, service: K, ...args: ArgumentTypes<T[K]>) {
    const [result, setResult] = useState(null)
    const [error, setError] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
      ipc.call(service, ...args)
        .then(res => setResult(res))
        .catch(err => setError(err))
        .finally(() => setLoading(false))
    }, [ipc, service, ...args])

    return { result, error, loading }
  }
