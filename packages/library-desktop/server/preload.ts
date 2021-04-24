import { contextBridge, ipcRenderer } from 'electron'
import { ServiceIpcClient } from './ipc/ServiceIpcClient'
import { LibraryIpcServiceMap } from './services'

const client = new ServiceIpcClient<LibraryIpcServiceMap>(ipcRenderer)
contextBridge.exposeInMainWorld('ipc', client)
