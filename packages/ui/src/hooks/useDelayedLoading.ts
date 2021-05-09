import { useEffect, useState } from 'react'
import { UseDelayedLoadingHook } from '../types'

export const DEFAULT_DELAY = 250

export const useDelayedLoading: UseDelayedLoadingHook = (loading, delay = DEFAULT_DELAY) => {
  const [delayedLoading, setDelayedLoading] = useState(false)
  const [t, setT] = useState(null as any)

  useEffect(() => {
    if (!loading) {
      clearTimeout(t)
      return setDelayedLoading(false)
    }

    setT(setTimeout(() => {
      setDelayedLoading(true)
    }, delay))

    return () => clearTimeout(t)
  }, [loading])

  return delayedLoading
}
