import { useEffect, useState } from 'react'

export const useHover = (target?: EventTarget | null) => {
  const [hover, setHover] = useState(false)

  useEffect(() => {
    const onMouseEnter = () => setHover(true)
    const onMouseLeave = () => setHover(false)
    target?.addEventListener('mouseenter', onMouseEnter)
    target?.addEventListener('mouseleave', onMouseLeave)

    return () => {
      target?.removeEventListener('mouseenter', onMouseEnter)
      target?.removeEventListener('mouseleave', onMouseLeave)
    }
  }, [target])

  return hover
}
