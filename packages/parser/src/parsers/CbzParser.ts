import { unzip, ZipEntry } from 'unzipit'
import { entryIsPage, sortByAsc } from '../utils'
import { ComicParser, Comic, ComicPage } from '../protocols'

export class CbzParser implements ComicParser {
  public async parse(file: File): Promise<Comic> {
    const archive = await unzip(file)
    const entries = Object.keys(archive.entries)
      .map(key => archive.entries[key])
      .filter(zipEntryIsPage)
      .sort(sortByAsc('name'))

    const pages = entries.map((entry, index) => ({
      index,
      size: 'single' as ComicPage['size'],
      name: entry.name,
      read: () => archive.entries[entry.name].arrayBuffer()
    }))

    return {
      name: file.name,
      pages: pages
    }
  }
}

export function zipEntryIsPage(entry: ZipEntry) {
  return entryIsPage({
    name: entry.name,
    isDirectory: entry.isDirectory
  })
}
