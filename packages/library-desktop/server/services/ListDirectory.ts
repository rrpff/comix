import path from 'path'
import fs from 'fs'
import { ListDirectoryService } from '../../src/protocols/services'

interface Filesystem {
  readdir(path: string, options: { withFileTypes: true }): Promise<{
    isFile(): boolean
    isDirectory(): boolean
    name: string
  }[]>
}

const NodeFilesystem: Filesystem = {
  readdir: fs.promises.readdir
}

export const ListDirectory: ListDirectoryService = async (directory: string, filesystem: Filesystem = NodeFilesystem) => {
  const results = await filesystem.readdir(directory, { withFileTypes: true })
  const base = { directories: [], files: [] }
  const response = results.reduce((acc, result) => {
    const entry = {
      name: result.name,
      path: path.join(directory, result.name),
    }

    if (result.isFile()) return { ...acc, files: [...acc.files, entry] }
    if (result.isDirectory()) return { ...acc, directories: [...acc.directories, entry] }
    return acc
  }, base)

  return { success: response }
}
