import { renderHook, act } from '@testing-library/react-hooks'
import { useKeymap } from './useKeymap'

it.each(['a', 'b', 'c'])('calls the given function when a key is pressed', (key) => {
  const { target, dispatch } = subject()
  const spy = jest.fn()

  renderHook(() => useKeymap(target, { keydown: { [key]: spy } }))
  act(() => { dispatch('keydown', { key }) })

  expect(spy).toHaveBeenCalled()
})

it('only calls the correct function for a given key', () => {
  const { target, dispatch } = subject()
  const keymap = {
    keydown: {
      ArrowLeft: jest.fn(),
      ArrowRight: jest.fn()
    }
  }

  renderHook(() => useKeymap(target, keymap))
  act(() => { dispatch('keydown', { key: 'ArrowRight' }) })

  expect(keymap.keydown.ArrowLeft).not.toHaveBeenCalled()
  expect(keymap.keydown.ArrowRight).toHaveBeenCalled()
})

it.each(['keydown', 'keypress', 'keyup'])('supports keydown, keypress and keyup', (eventType) => {
  const { target, dispatch } = subject()
  const keymap = {
    keydown: { Enter: jest.fn() },
    keypress: { Enter: jest.fn() },
    keyup: { Enter: jest.fn() },
  }

  renderHook(() => useKeymap(target, keymap))
  act(() => { dispatch(eventType, { key: 'Enter' }) })

  ;'keydown' === eventType
    ? expect(keymap.keydown.Enter).toHaveBeenCalled()
    : expect(keymap.keydown.Enter).not.toHaveBeenCalled()

  ;'keypress' === eventType
    ? expect(keymap.keypress.Enter).toHaveBeenCalled()
    : expect(keymap.keypress.Enter).not.toHaveBeenCalled()

  ;'keyup' === eventType
    ? expect(keymap.keyup.Enter).toHaveBeenCalled()
    : expect(keymap.keyup.Enter).not.toHaveBeenCalled()
})

type Listener = (event: Event) => void

const subject = () => {
  const listeners = {
    keydown: new Set<Listener>(),
    keypress: new Set<Listener>(),
    keyup: new Set<Listener>(),
  } as { [key: string]: Set<Listener> }

  const target = {
    addEventListener: (event: string, listener: Listener) =>
      listeners[event].add(listener),
    removeEventListener: (event: string, listener: Listener) =>
      listeners[event].delete(listener),
    dispatchEvent: (event: Event) => {
      ;(listeners[event.type] || []).forEach(listener => listener(event))
      return true
    },
  }

  const dispatch = (eventName: string, eventArgs: { key?: string, keyCode?: number }) => {
    const event = new KeyboardEvent(eventName, eventArgs)
    target.dispatchEvent(event)
  }

  return { target, dispatch }
}
