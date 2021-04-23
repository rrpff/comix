import { useEffect, useState } from 'react'

export const useMouseIsActive = (target: EventTarget | null, duration: number) => {
  const [active, setActive] = useState(false)
  const [timer, setTimer] = useState(undefined as ReturnType<typeof setTimeout> | undefined)

  useEffect(() => {
    const listener = () => {
      active === false && setActive(true)
      timer && clearTimeout(timer)
      setTimer(setTimeout(() => {
        setActive(false)
      }, duration))
    }

    target?.addEventListener('mousemove', listener)
    return () => target?.removeEventListener('mousemove', listener)
  }, [active, target, duration, timer])

  return active
}
