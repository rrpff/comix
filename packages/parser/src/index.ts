import { unzip, ZipEntry } from 'unzipit'

export interface ComicPage {
  index: number
  size: 'single' | 'double'
  name: string
  read: () => Promise<ArrayBuffer>
}

export interface Comic {
  name: string
  pages: ComicPage[]
}

export class CbzParser {
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

export class Parser {
  public async parse(file: File): Promise<Comic> {
    return new CbzParser().parse(file)
  }
}

function zipEntryIsPage(entry: ZipEntry) {
  const isNotDsStore = () => !entry.name.endsWith('.DS_Store')
  const isNotMacFile = () => !entry.name.startsWith('__MACOSX/')
  const isNotDirectory = () => !entry.isDirectory

  return isNotDsStore() && isNotMacFile() && isNotDirectory()
}

function sortByAsc<T>(key: keyof T) {
  return (a: T, b: T) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  }
}
