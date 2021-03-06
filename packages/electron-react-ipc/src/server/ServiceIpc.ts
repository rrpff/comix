import { ArgumentTypes, ServiceMap, Service, ServiceLogger, ServiceIpcEvent, IpcHandler } from '../protocols'

export class ServiceIpc<TServiceMap extends ServiceMap = ServiceMap> implements IpcHandler<TServiceMap> {
  private services: Map<keyof(TServiceMap), Service<any, any>> = new Map()
  private logger?: ServiceLogger

  public log = (logger: ServiceLogger) => {
    this.logger = logger
  }

  public use = async <K extends keyof(TServiceMap)>(service: K, handler: TServiceMap[K]) => {
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
