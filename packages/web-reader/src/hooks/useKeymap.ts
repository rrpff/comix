import { useEffect } from 'react'

interface Keymap {
  [key: string]: (event: KeyboardEvent) => void
}

interface MultiEventKeymap {
  keydown?: Keymap
  keypress?: Keymap
  keyup?: Keymap
}

type KeyboardEventTarget = Pick<Window, 'addEventListener' | 'removeEventListener' | 'dispatchEvent'>

export const useKeymap = (target: KeyboardEventTarget, keymap: MultiEventKeymap) => {
  useKeymapEventType(target, 'keydown', keymap.keydown)
  useKeymapEventType(target, 'keyup', keymap.keyup)
  useKeymapEventType(target, 'keypress', keymap.keypress)
}

const useKeymapEventType = (target: KeyboardEventTarget, eventType: keyof MultiEventKeymap, keymap?: Keymap) => {
  useEffect(() => {
    if (keymap === undefined) return

    const listener = (e: KeyboardEvent) => {
      const handler = keymap[e.key]
      handler?.call(null, e)
    }

    target.addEventListener(eventType, listener)

    return () => {
      target.removeEventListener(eventType, listener)
    }
  }, [target, eventType, keymap])
}
