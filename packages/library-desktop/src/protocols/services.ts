import { Service } from 'electron-react-ipc/client'

interface DirectoryEntry {
  name: string
  path: string
}

export type ListDirectoryService = Service<[directory: string, filesystem?: any], {
  directories: DirectoryEntry[]
  files: DirectoryEntry[]
}>

export type LibraryIpcServiceMap = {
  'list-directory': ListDirectoryService
}
