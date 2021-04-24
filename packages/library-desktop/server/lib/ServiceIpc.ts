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

export interface ServiceLogger {
  info?(...messages: any[]): void
  error?(...messages: any[]): void
}

export class ServiceIpc<TServiceMap extends ServiceMap = ServiceMap> {
  private services: Map<keyof(TServiceMap), Service<any>> = new Map()
  private logger?: ServiceLogger

  public log = (logger: ServiceLogger) => {
    console.log('added logger :-)')
    this.logger = logger
  }

  public use = async <T, K extends keyof(TServiceMap)>(service: K, handler: Service<T>) => {
    this.services.set(service, handler)
  }

  public handle = async <K extends keyof(TServiceMap)>(
    ipcEvent: ServiceIpcEvent,
    requestId: string,
    serviceName: K,
    ...args: ArgumentTypes<TServiceMap[K]>
  ): Promise<void> => {
    if (!ipcEvent) throw new Error('No ipcEvent given')
    if (!ipcEvent.sender) throw new Error('No sender given')
    if (!requestId) throw new Error('No request ID given')
    if (!serviceName) throw new Error('No service given')

    this.logRequest(requestId, serviceName as string, args)

    const service = this.services.get(serviceName)

    if (service === undefined) {
      this.logger?.error?.call(this.logger, 'ipc-response', requestId, serviceName, 'error')
      this.logResponse(requestId, serviceName as string, false)
      return ipcEvent.sender.send('ipc-response', requestId, { error: `Invalid service: ${serviceName}` })
    }

    const response = await service(...args)
    this.logResponse(requestId, serviceName as string, Object.keys(response).includes('success'))
    ipcEvent.sender.send('ipc-response', requestId, response)
  }

  private logRequest = (requestId: string, serviceName: string, args: any[]) =>
    this.logger?.info?.call(this.logger, 'ipc-request', requestId, serviceName, args)

  private logResponse = (requestId: string, serviceName: string, successful: boolean) => {
    const message = successful ? 'success' : 'error'
    const func = successful ? this.logger?.info : this.logger?.error
    func?.call(this.logger, 'ipc-response', requestId, serviceName, message)
  }
}
