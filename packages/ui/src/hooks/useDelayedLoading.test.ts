import { renderHook, act } from '@testing-library/react-hooks'
import { useDelayedLoading, DEFAULT_DELAY } from './useDelayedLoading'

beforeEach(() => jest.useFakeTimers())

it('returns false immediately', async () => {
  const { result } = renderHook(() => useDelayedLoading(true))

  expect(result.current).toEqual(false)

  act(() => { jest.advanceTimersByTime(DEFAULT_DELAY) })
})

it('returns true after a delay if the loading value is true', async () => {
  const { result } = renderHook(() => useDelayedLoading(true))

  act(() => { jest.advanceTimersByTime(DEFAULT_DELAY) })

  expect(result.current).toEqual(true)
})

it('stays false after a delay if the loading value is false', async () => {
  const { result } = renderHook(() => useDelayedLoading(false))

  act(() => { jest.advanceTimersByTime(DEFAULT_DELAY) })

  expect(result.current).toEqual(false)
})

it('stays supports a custom delay', async () => {
  const { result } = renderHook(() => useDelayedLoading(true, 10000))

  act(() => { jest.advanceTimersByTime(DEFAULT_DELAY) })

  expect(result.current).toEqual(false)

  act(() => { jest.advanceTimersByTime(10000) })

  expect(result.current).toEqual(true)
})
