import { contextBridge, ipcRenderer } from 'electron'
import { ServiceIpcClient } from 'electron-react-ipc/server'
import { LibraryIpcServiceMap } from './services'

const client = new ServiceIpcClient<LibraryIpcServiceMap>(ipcRenderer)
contextBridge.exposeInMainWorld('ipc', client)
