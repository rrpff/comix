export type ArgumentTypes<T extends Function> = T extends (...args: infer A) => void ? A : never[];

export type ServiceIpcSuccessResponse<T> = { success: T }
export type ServiceIpcErrorResponse = { error: string }
export type ServiceIpcResponse<T> = ServiceIpcSuccessResponse<T> | ServiceIpcErrorResponse
export type Service<T> = (...args: any[]) => Promise<ServiceIpcResponse<T>>
export type SuccessType<T> = T extends Service<infer R> ? R : never

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

export type IpcListener<T> = (_: any, requestId: string, response: ServiceIpcResponse<T>) => void
export interface ServiceIpcRenderer {
  send(event: 'ipc-request', requestId: string, service: string, ...args: any[]): void
  on(event: 'ipc-response', listener: IpcListener<any>): void
  off(event: 'ipc-response', listener: IpcListener<any>): void
}

export interface IpcClient<TServiceMap extends ServiceMap> {
  call<T, K extends keyof(TServiceMap)>(service: K, ...args: ArgumentTypes<TServiceMap[K]>): Promise<SuccessType<TServiceMap[K]>>
}

export interface IpcHandler<TServiceMap extends ServiceMap> {
  log(logger: ServiceLogger): void
  use<K extends keyof(TServiceMap)>(service: K, handler: TServiceMap[K]): Promise<void>
  handle<K extends keyof(TServiceMap)>(
    ipcEvent: ServiceIpcEvent,
    requestId: string,
    serviceName: K,
    ...args: ArgumentTypes<TServiceMap[K]>
  ): Promise<void>
}
