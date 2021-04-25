import fs from 'fs/promises'
import path from 'path'
import { Comic } from '@comix/parser'
import { v4 as uuid } from 'uuid'
import mkdirp from 'mkdirp'
import { LibraryEntry, MetadataAdapter } from '../protocols'

export interface CoverMetadataAdapterConfig {
  imageDirectory: string
}

export class CoverMetadataAdapter implements MetadataAdapter {
  constructor(private config: CoverMetadataAdapterConfig) {}

  async process(entry: LibraryEntry, comic: Comic | null): Promise<Partial<LibraryEntry>> {
    if (entry.corrupt || comic === null) return {}

    const coverImage = comic.images[0]
    const data = await coverImage.read()
    const coverFileName = await saveAsImage(data, this.config.imageDirectory)

    return { coverFileName }
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
