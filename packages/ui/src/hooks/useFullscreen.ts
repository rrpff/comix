import { useEffect, useState } from 'react'

export const useFullscreen = (target?: Element | null): [boolean, (value: boolean) => void] => {
  const [fullscreen, setStoredFullscreen] = useState(false)

  const exitFullscreen = () => {
    if (document.fullscreenElement !== null) {
      document.exitFullscreen()
    }
  }

  const enterFullscreen = () => {
    target?.requestFullscreen()
      .catch(() => setFullscreen(false))
  }

  const setFullscreen = (value: boolean) => {
    if (value) enterFullscreen()
    else exitFullscreen()

    setStoredFullscreen(value)
  }

  useEffect(() => {
    const listener = () => {
      setStoredFullscreen(document.fullscreenElement !== null)
    }

    document.addEventListener('fullscreenchange', listener)
    return () => document.removeEventListener('fullscreenchange', listener)
  })

  return [fullscreen, setFullscreen]
}
