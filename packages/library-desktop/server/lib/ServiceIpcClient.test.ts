import { EventEmitter } from 'events'
import { ServiceIpcClient } from './ServiceIpcClient'

const subject = () => {
  const main = new EventEmitter()
  const renderer: any = new EventEmitter()
  renderer.send = jest.fn((event: string, ...args: any[]) => {
    main.emit(event, ...args)
  })

  const client = new ServiceIpcClient(renderer)

  return { client, renderer, main }
}

it.each([
  ['whatever', []],
  ['cool', []],
  ['whatever-with-args', ['one', 'two']],
])('should dispatch calls as request events through the renderer', async (service, args) => {
  expect.assertions(2)

  const { client, main } = subject()
  main.on('ipc-request', async (_requestId: string, receivedService: string, ...receivedArgs: any[]) => {
    expect(receivedService).toEqual(service)
    expect(receivedArgs).toEqual(args)
  })

  client.call(service, ...args)
})

it('should resolve responses to calls', async () => {
  const { client, renderer, main } = subject()
  const expectedResponse = { success: Math.random() }

  main.on('ipc-request', async (requestId: string, _serviceName: string, ...args: any[]) => {
    renderer.emit('ipc-response', null, requestId, expectedResponse)
  })

  const response = await client.call('whatever')
  expect(response).toEqual(expectedResponse.success)
})

it('should reject error responses', async () => {
  const { client, renderer, main } = subject()
  const expectedResponse = { error: Math.random() }

  main.on('ipc-request', async (requestId: string, _serviceName: string, ...args: any[]) => {
    renderer.emit('ipc-response', null, requestId, expectedResponse)
  })

  const call = client.call('whatever')
  await expect(call).rejects.toEqual(expectedResponse.error)
})

it('should not confuse parallel requests', async () => {
  jest.useFakeTimers()

  const { client, renderer, main } = subject()

  main.on('ipc-request', async (requestId: string, _serviceName: string, num: number) => {
    setTimeout(() => {
      renderer.emit('ipc-response', null, requestId, { success: num * 10 })
    }, Math.random() * 5000)
  })

  const numbers = [Math.random(), Math.random(), Math.random()]
  const promise = Promise.all(numbers.map(num => {
    return client.call('times-ten', num)
  }))

  jest.advanceTimersByTime(6000)

  const responses = await promise

  expect(responses[0]).toEqual(numbers[0] * 10)
  expect(responses[1]).toEqual(numbers[1] * 10)
  expect(responses[2]).toEqual(numbers[2] * 10)
})

it('should clean up listeners after requests complete', async () => {
  const { client, renderer, main } = subject()

  main.on('ipc-request', async (requestId: string, _serviceName: string, num: number) => {
    renderer.emit('ipc-response', null, requestId, { success: num * 10 })
  })

  await client.call('cool-service')

  expect(renderer.listenerCount('ipc-response')).toEqual(0)
})
