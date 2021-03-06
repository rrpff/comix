import { v4 as uuid } from 'uuid'
import { ServiceIpc } from './ServiceIpc'

const subject = async () => {
  const ipc = new ServiceIpc()
  const sender = { send: jest.fn() }
  const event = { sender }
  const requestId = uuid()

  return { ipc, event, requestId }
}

it.each([null, undefined])('throws an error if no ipcEvent is given', async (value) => {
  const { ipc } = await subject()
  const call = ipc.handle(value!, value!, value!)

  await expect(call).rejects.toEqual(new Error('No ipcEvent given'))
})

it.each([null, undefined])('throws an error if no ipcEvent sender is present', async (value) => {
  const { ipc } = await subject()
  const call = ipc.handle({ sender: value! }, value!, value!)

  await expect(call).rejects.toEqual(new Error('No sender given'))
})

it.each([null, undefined, ''])('throws an error if no request ID is given', async (value) => {
  const { ipc, event } = await subject()
  const call = ipc.handle(event, value!, value!)

  await expect(call).rejects.toEqual(new Error('No request ID given'))
})

it.each([null, undefined, ''])('throws an error if no service is given', async (value) => {
  const { ipc, event, requestId } = await subject()
  const call = ipc.handle(event, requestId, value!)

  await expect(call).rejects.toEqual(new Error('No service given'))
})

it.each([
  'cool-service',
  'great-service',
])('responds with an error when calling a service which does not exist', async (serviceName) => {
  const { ipc, event, requestId } = await subject()
  await ipc.handle(event, requestId, serviceName)

  expect(event.sender.send).toHaveBeenCalledWith('ipc-response', requestId, { error: `Invalid service: ${serviceName}` })
})

it.each([
  ['double', async (num: number) => ({ success: num * 2 })],
  ['triple', async (num: number) => ({ error: (num * 3).toString() })],
])('calls the service function if known', async (serviceName, serviceHandler) => {
  const { ipc, event, requestId } = await subject()
  ipc.use(serviceName, serviceHandler)

  const input = Math.random() * 10
  const expectedResult = await serviceHandler(input)
  await ipc.handle(event, requestId, serviceName, input)

  expect(event.sender.send).toHaveBeenCalledWith('ipc-response', requestId, expectedResult)
})

it('calls the info logging function on requests if given', async () => {
  const logger = { info: jest.fn() }
  const { ipc, event, requestId } = await subject()

  ipc.log(logger)
  await ipc.handle(event, requestId, 'whatever', 'test')

  expect(logger.info).toHaveBeenCalledWith('ipc-request', requestId, 'whatever', ['test'])
})

it('calls the info logging function on successful responses', async () => {
  const logger = { info: jest.fn() }
  const { ipc, event, requestId } = await subject()
  const double = async (num: number) => ({ success: num * 2 })

  ipc.log(logger)
  ipc.use('double', double)
  await ipc.handle(event, requestId, 'double', 20)

  expect(logger.info).toHaveBeenCalledWith('ipc-response', requestId, 'double', 'success')
})

it('calls the error logging function on error responses', async () => {
  const logger = { error: jest.fn() }
  const { ipc, event, requestId } = await subject()
  const double = async (num: number) => ({ error: 'NaN' })

  ipc.log(logger)
  ipc.use('double', double)
  await ipc.handle(event, requestId, 'double', 20)

  expect(logger.error).toHaveBeenCalledWith('ipc-response', requestId, 'double', 'error')
})
