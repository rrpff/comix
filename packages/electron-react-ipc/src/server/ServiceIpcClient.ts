import { v4 as uuid } from 'uuid'
import { Service, ServiceIpcResponse, ServiceMap } from './ServiceIpc'

type ArgumentTypes<T extends Function> = T extends (...args: infer A) => void ? A : never[];
type SuccessType<T> = T extends Service<infer R> ? R : never

export type IpcListener<T> = (_: any, requestId: string, response: ServiceIpcResponse<T>) => void
export interface ServiceIpcRenderer {
  send(event: 'ipc-request', requestId: string, service: string, ...args: any[]): void
  on(event: 'ipc-response', listener: IpcListener<any>): void
  off(event: 'ipc-response', listener: IpcListener<any>): void
}

export class ServiceIpcClient<TServiceMap extends ServiceMap = ServiceMap> {
  constructor(private renderer: ServiceIpcRenderer) {}

  public call = <T, K extends keyof(TServiceMap)>(service: K, ...args: ArgumentTypes<TServiceMap[K]>)
    : Promise<SuccessType<TServiceMap[K]>> => {
    return new Promise((resolve, reject) => {
      const requestId = uuid()
      const listener = (_: any, responseRequestId: string, response: ServiceIpcResponse<T>) => {
        if (responseRequestId !== requestId) return

        this.renderer.off('ipc-response', listener)

        if ('success' in response) resolve(response.success as SuccessType<TServiceMap[K]>)
        else reject(response.error)
      }

      this.renderer.on('ipc-response', listener)
      this.renderer.send('ipc-request', requestId, service as string, ...args)
    })
  }
}
