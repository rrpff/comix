import { renderHook, act } from '@testing-library/react-hooks'
import { useMouseIsActive } from './useMouseIsActive'

const subject = () => {
  const listeners = new Set<(event: Event) => void>()
  const target = {
    addEventListener: (event: 'mousemove', listener: (event: Event) => void) =>
      listeners.add(listener),
    removeEventListener: (event: 'mousemove', listener: (event: Event) => void) =>
      listeners.delete(listener),
    dispatchEvent: (event: Event) => {
      listeners.forEach(listener => listener(event))
      return true
    },
  }

  const dispatch = (x: number, y: number) => target.dispatchEvent(
    new MouseEvent('mousemove', { clientX: x, clientY: y }))

  return { target, dispatch }
}

it('defaults to false', () => {
  const { target } = subject()
  const { result } = renderHook(() => useMouseIsActive(target, 1000))

  expect(result.current).toEqual(false)
})

it('is true when the mouse has been active', () => {
  const { target, dispatch } = subject()
  const { result } = renderHook(() => useMouseIsActive(target, 1000))

  act(() => {
    dispatch(50, 50)
  })

  expect(result.current).toEqual(true)
})

it('returns to false after activity', async () => {
  const { target, dispatch } = subject()
  const { result, waitForNextUpdate } = renderHook(() => useMouseIsActive(target, 10))

  act(() => { dispatch(50, 50) })
  expect(result.current).toEqual(true)

  await waitForNextUpdate()
  expect(result.current).toEqual(false)
})

it('only returns to false after activity when the given duration has passed', async () => {
  jest.useFakeTimers()

  const { target, dispatch } = subject()
  const { result } = renderHook(() => useMouseIsActive(target, 1000))

  act(() => { dispatch(50, 50) })
  expect(result.current).toEqual(true)

  act(() => { jest.advanceTimersByTime(900) })
  expect(result.current).toEqual(true)

  act(() => { jest.advanceTimersByTime(101) })
  expect(result.current).toEqual(false)
})

it('resets the waiting duration after each moment of activity', async () => {
  jest.useFakeTimers()

  const { target, dispatch } = subject()
  const { result } = renderHook(() => useMouseIsActive(target, 1000))

  act(() => { dispatch(10, 10) })
  act(() => { jest.advanceTimersByTime(900) })
  act(() => { dispatch(50, 50) })
  act(() => { jest.advanceTimersByTime(101) })

  expect(result.current).toEqual(true)
})
