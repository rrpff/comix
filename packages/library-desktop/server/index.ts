import path from 'path'
import { app, BrowserWindow, ipcMain } from 'electron'
import { ServiceIpc } from 'electron-react-ipc/server'
import { LibraryIpcServiceMap } from '../src/protocols/services'
import { ListDirectory } from './services/ListDirectory'
import { GetFile } from './services/GetFile'

const ipc = new ServiceIpc<LibraryIpcServiceMap>()

ipc.log(console)
ipc.use('list-directory', ListDirectory)
ipc.use('get-file', GetFile)

ipcMain.on('ipc-request', async (ipcEvent, requestId: string, service: string, ...args: any[]) => {
  try {
    await ipc.handle(ipcEvent, requestId, service as any, ...args)
  } catch (e) {
    console.error(e)
  }
})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1300,
    height: 800,
    backgroundColor: '#fff',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  win.loadURL('http://localhost:3000')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
