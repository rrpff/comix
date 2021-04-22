import { useEffect, useState } from 'react'

export const useMouseIsActive = (target: EventTarget | null, duration: number) => {
  const [active, setActive] = useState(false)
  const [timer, setTimer] = useState(undefined as ReturnType<typeof setTimeout> | undefined)

  useEffect(() => {
    const listener = () => {
      setActive(true)
      timer && clearTimeout(timer)
      setTimer(setTimeout(() => {
        setActive(false)
      }, duration))
    }

    target?.addEventListener('mousemove', listener)
    return () => target?.removeEventListener('mousemove', listener)
  }, [target, duration, timer])

  return active
}
