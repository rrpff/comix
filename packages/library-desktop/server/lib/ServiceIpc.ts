type ArgumentTypes<T extends Function> = T extends (...args: infer A) => void ? A : never[];

export type ServiceIpcSuccessResponse<T> = { success: T }
export type ServiceIpcErrorResponse<T> = { error: T }
export type ServiceIpcResponse<T> = ServiceIpcSuccessResponse<T> | ServiceIpcErrorResponse<T>
export type Service<T> = (...args: any[]) => Promise<ServiceIpcResponse<T>>

export interface ServiceIpcEvent {
  sender: {
    send(channel: string, requestId: string, ...args: any[]): void
  }
}

export interface ServiceMap {
  [key: string]: Service<any>
}

export class ServiceIpc<TServiceMap extends ServiceMap = ServiceMap> {
  private services: Map<keyof(TServiceMap), Service<any>> = new Map()

  public async use<T, K extends keyof(TServiceMap)>(service: K, handler: Service<T>) {
    this.services.set(service, handler)
  }

  public async handle<K extends keyof(TServiceMap)>(
    ipcEvent: ServiceIpcEvent,
    requestId: string,
    serviceName: K,
    ...args: ArgumentTypes<TServiceMap[K]>
  ): Promise<void> {
    if (!ipcEvent) throw new Error('No ipcEvent given')
    if (!ipcEvent.sender) throw new Error('No sender given')
    if (!requestId) throw new Error('No request ID given')
    if (!serviceName) throw new Error('No service given')

    const service = this.services.get(serviceName)

    if (service === undefined) {
      return ipcEvent.sender.send('ipc-response', requestId, { error: `Invalid service: ${serviceName}` })
    }

    const response = await service(...args)
    ipcEvent.sender.send('ipc-response', requestId, response)
  }
}
