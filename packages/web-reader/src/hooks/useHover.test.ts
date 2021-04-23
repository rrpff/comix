import { renderHook, act } from '@testing-library/react-hooks'
import { useHover } from './useHover'

it('defaults to false', () => {
  const { target } = subject()
  const { result } = renderHook(() => useHover(target))

  expect(result.current).toEqual(false)
})

it('returns true after a mouseenter event', () => {
  const { target, dispatch } = subject()
  const { result } = renderHook(() => useHover(target))

  act(() => { dispatch('mouseenter') })

  expect(result.current).toEqual(true)
})

it('returns false after a subsequent mouseleave event', () => {
  const { target, dispatch } = subject()
  const { result } = renderHook(() => useHover(target))

  act(() => { dispatch('mouseenter') })
  act(() => { dispatch('mouseleave') })

  expect(result.current).toEqual(false)
})

it('can handle a null target', () => {
  const { result } = renderHook(() => useHover(null))

  expect(result.current).toEqual(false)
})

it('can handle an undefined target', () => {
  const { result } = renderHook(() => useHover(undefined))

  expect(result.current).toEqual(false)
})

type Listener = (event: Event) => void

const subject = () => {
  const listeners = {
    mouseenter: new Set<Listener>(),
    mouseleave: new Set<Listener>(),
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

  const dispatch = (eventName: string) => target.dispatchEvent(new MouseEvent(eventName))

  return { target, dispatch }
}
