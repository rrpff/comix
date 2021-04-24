import { v4 as uuid } from 'uuid'
import { ServiceIpcErrorResponse, ServiceIpcResponse, ServiceIpcSuccessResponse } from './ServiceIpc'

type IpcListener<T> = (_: any, requestId: string, response: ServiceIpcResponse<T>) => void

interface ServiceIpcRenderer {
  send(event: 'ipc-request', requestId: string, service: string, ...args: any[]): void
  on(event: 'ipc-response', listener: IpcListener<any>): void
  off(event: 'ipc-response', listener: IpcListener<any>): void
}

export class ServiceIpcClient {
  constructor(private renderer: ServiceIpcRenderer) {}

  public call<T>(service: string, ...args: any[]): Promise<T> {
    return new Promise((resolve, reject) => {
      const requestId = uuid()
      const listener = (_: any, responseRequestId: string, response: ServiceIpcResponse<T>) => {
        if (responseRequestId !== requestId) return

        this.renderer.off('ipc-response', listener)

        const successful = Object.keys(response).includes('success')
        if (successful) {
          resolve((response as ServiceIpcSuccessResponse<T>).success)
        } else {
          reject((response as ServiceIpcErrorResponse<T>).error)
        }
      }

      this.renderer.on('ipc-response', listener)
      this.renderer.send('ipc-request', requestId, service, ...args)
    })
  }
}
