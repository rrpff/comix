import { Service } from 'electron-react-ipc/client'

interface DirectoryEntry {
  name: string
  path: string
}

interface LocalFile {
  name: string
  path: string
  type: string
  content: ArrayBuffer
}

export type ListDirectoryService = Service<[directory: string, filesystem?: any], {
  directories: DirectoryEntry[]
  files: DirectoryEntry[]
}>

export type GetFileService = Service<[path: string], LocalFile>

export type LibraryIpcServiceMap = {
  'list-directory': ListDirectoryService
  'get-file': GetFileService
}
