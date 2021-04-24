import { renderHook } from '@testing-library/react-hooks'
import { useIpc } from './useIpc'

it.each([
  ['whatever', []],
  ['double', [123]],
])('should call the ipc function with the given args', (service, args) => {
  const ipc = { call: jest.fn() }
  renderHook(() => useIpc(ipc, service, ...args))

  expect(ipc.call).toHaveBeenCalledWith(service, ...args)
})

it('should return the result of the ipc call', async () => {
  const number = Math.random()
  const ipc = { call: jest.fn(async () => number) }
  const { result, waitForNextUpdate } = renderHook(() => useIpc(ipc, 'whatever'))

  await waitForNextUpdate()

  expect(result.current.result).toEqual(number)
})

it.each([
  'something bad went wrong',
  'nope',
])('should return the error of an ipc call', async (errorMessage) => {
  const ipc = { call: jest.fn(() => Promise.reject(errorMessage)) }
  const { result, waitForNextUpdate } = renderHook(() => useIpc(ipc, 'whatever'))

  await waitForNextUpdate()

  expect(result.current.error).toEqual(errorMessage)
})

it('should return loading until the call completes', async () => {
  const number = Math.random()
  const ipc = { call: jest.fn(async () => number) }
  const { result, waitForNextUpdate } = renderHook(() => useIpc(ipc, 'whatever'))

  expect(result.current.loading).toEqual(true)

  await waitForNextUpdate()
  expect(result.current.loading).toEqual(false)
})

it('should not recall every render', async () => {
  const number = Math.random()
  const ipc = { call: jest.fn(async () => number) }
  const { waitForNextUpdate } = renderHook(() => useIpc(ipc, 'whatever'))

  await waitForNextUpdate()

  expect(ipc.call).toHaveBeenCalledTimes(1)
})
