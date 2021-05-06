import fs from 'fs/promises'
import path from 'path'
import { Comic } from '@comix/parser'
import { v4 as uuid } from 'uuid'
import mkdirp from 'mkdirp'
import jimp from 'jimp'
import { LibraryEntry, MetadataAdapter } from '../protocols'

export interface CoverMetadataAdapterConfig {
  imageDirectory: string
}

export class CoverMetadataAdapter implements MetadataAdapter {
  constructor(private config: CoverMetadataAdapterConfig) {}

  async process(entry: LibraryEntry, comic: Comic | null) {
    if (entry.corrupt || comic === null) return { changes: {} }

    const coverImage = comic.images[0]
    const data = await coverImage.read()
    const coverFileName = await saveImages(data, this.config.imageDirectory)

    return {
      changes: { coverFileName }
    }
  }
}

const saveImages = async (imageData: ArrayBuffer, directory: string) => {
  const fileId = uuid()
  const fileName = `${fileId}.jpg`
  const versions = [
    { name: 'small', data: resize(imageData, 240) },
    { name: 'tiny', data: resize(imageData, 30) },
  ]

  await Promise.all(versions.map(async version => {
    const imageData = await version.data
    const imageDirectory = path.join(directory, version.name)
    await saveAsImage(imageData, imageDirectory, fileName)
  }))

  return fileName
}

const saveAsImage = async (imageData: ArrayBuffer, directory: string, fileName: string) => {
  const filePath = path.join(directory, fileName)

  try {
    await mkdirp(directory)
    await fs.writeFile(filePath, Buffer.from(imageData), { flag: 'w+' })
  } catch (e) {
    console.error(e)
  }
}

const resize = async (imageData: ArrayBuffer, height: number) => {
  const image = await jimp.read(Buffer.from(imageData))
  return image
    .resize(jimp.AUTO, height)
    .getBufferAsync(jimp.MIME_JPEG)
}
