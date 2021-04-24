import { useState, useEffect } from 'react'
import { ArgumentTypes, IpcClient, Service, ServiceReturn } from '../protocols'

export function useIpc<T extends Service<any, any>>(
  ipc: IpcClient<any>,
  service: string,
  ...args: ArgumentTypes<T>
) {
  const [result, setResult] = useState(null as ServiceReturn<T> | null)
  const [error, setError] = useState(null as string | null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    ipc.call(service, ...args)
      .then(res => setResult(res as ServiceReturn<T>))
      .catch(err => setError(err))
      .finally(() => setLoading(false))
  }, [ipc, service, ...args])

  return { result, error, loading }
}
