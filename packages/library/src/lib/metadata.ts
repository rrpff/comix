import path from 'path'
import fs from 'fs/promises'
import { Parser } from '@comix/parser'
import { ComicFileStat, LibraryEntry } from '../protocols'

export const metadata = async (stat: ComicFileStat): Promise<LibraryEntry> => {
  try {
    const fname = path.basename(stat.path)
    const data = await fs.readFile(stat.path)
    const parser = new Parser()
    let corrupt = false

    try {
      await parser.parse(Uint8Array.from(data).buffer, fname)
    } catch (e) {
      console.error(e)
      corrupt = true
    }

    return {
      filePath: stat.path,
      fileName: fname,
      fileLastModified: stat.lastModified,
      fileLastProcessed: Date.now(),
      corrupt
    }
  } catch (e) {
    if (e.code === 'ENOENT')
      throw new Error(`File does not exist: ${stat.path}`)
    else throw e
  }
}
