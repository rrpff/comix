import path from 'path'
import fs from 'fs/promises'
import { v4 as uuid } from 'uuid'
import mkdirp from 'mkdirp'
import { ProcessedLibraryEntry, RawLibraryEntry } from '../protocols'

export interface ProcessConfig {
  imageDirectory: string
}

export const process = async (entry: RawLibraryEntry, config: ProcessConfig): Promise<ProcessedLibraryEntry> => {
  return {
    fileName: entry.fileName,
    filePath: entry.filePath,
    fileLastModified: entry.fileLastModified,
    fileLastProcessed: entry.fileLastProcessed,
    corrupt: entry.corrupt,
    coverFileName: entry.coverData !== undefined
      ? await saveAsImage(entry.coverData, config.imageDirectory)
      : undefined
  }
}

const saveAsImage = async (imageData: ArrayBuffer, directory: string) => {
  const fileId = uuid()
  const fileName = `${fileId}.jpg`
  const filePath = path.join(directory, fileName)

  try {
    await mkdirp(directory)
    await fs.writeFile(filePath, Buffer.from(imageData), { flag: 'w+' })
  } catch (e) {
    console.error(e)
  }

  return fileName
}
