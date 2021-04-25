import path from 'path'
import fs from 'fs/promises'
import globby from 'globby'
import { Parser } from '@comix/parser'

interface ComicFileMetadata {
  name: string
  path: string
  corrupt: boolean
  coverData?: ArrayBuffer
}

export const scan = (dir: string) => {
  return globby(dir, {
    expandDirectories: {
      extensions: ['cbr', 'cbz']
    }
  })
}

export const getMetadata = async (fpath: string): Promise<ComicFileMetadata> => {
  try {
    const fname = path.basename(fpath)
    const data = await fs.readFile(fpath)
    const parser = new Parser()
    let corrupt = false
    let archive = null
    let coverData = undefined

    try {
      archive = await parser.parse(Uint8Array.from(data).buffer, fname)
      const coverImage = archive.images[0]
      coverData = await coverImage.read()
    } catch (e) {
      console.error(e)
      corrupt = true
    }

    return {
      path: fpath,
      name: fname,
      corrupt,
      coverData
    }
  } catch (e) {
    if (e.code === 'ENOENT')
      throw new Error(`File does not exist: ${fpath}`)
    else throw e
  }
}
