import { contextBridge, ipcRenderer } from 'electron'
import { ServiceIpcClient } from 'electron-react-ipc/server'
import { LibraryIpcServiceMap } from '../src/protocols/services'

const client = new ServiceIpcClient<LibraryIpcServiceMap>(ipcRenderer)
contextBridge.exposeInMainWorld('ipc', client)
