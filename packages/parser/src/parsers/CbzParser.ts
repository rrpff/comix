import { unzip, ZipEntry } from 'unzipit'
import { entryIsPage, sortByAsc } from '../utils'
import { ComicParser, Comic } from '../protocols'

export class CbzParser implements ComicParser {
  public async parse(file: File): Promise<Comic> {
    const archive = await unzip(file)
    const entries = Object.keys(archive.entries)
      .map(key => archive.entries[key])
      .filter(zipEntryIsPage)
      .sort(sortByAsc('name'))

    const images = entries.map((entry, index) => ({
      index,
      name: entry.name,
      read: () => archive.entries[entry.name].arrayBuffer()
    }))

    return {
      name: file.name,
      images: images
    }
  }
}

export function zipEntryIsPage(entry: ZipEntry) {
  return entryIsPage({
    name: entry.name,
    isDirectory: entry.isDirectory
  })
}
