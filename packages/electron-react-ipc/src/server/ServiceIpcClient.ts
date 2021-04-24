import { v4 as uuid } from 'uuid'
import { ServiceMap, ServiceIpcRenderer, SuccessType, ServiceIpcResponse, IpcClient } from '../protocols'

type ArgumentTypes<T extends Function> = T extends (...args: infer A) => void ? A : never[];

export class ServiceIpcClient<TServiceMap extends ServiceMap = ServiceMap> implements IpcClient<TServiceMap> {
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
