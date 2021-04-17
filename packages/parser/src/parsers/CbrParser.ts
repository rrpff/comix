import { createExtractorFromData, FileHeader } from 'node-unrar-js'
import { ComicParser, Comic, ComicPage } from '../protocols'
import { entryIsPage, sortByAsc } from '../utils'

export class CbrParser implements ComicParser {
  public async parse(file: File): Promise<Comic> {
    const data = await file.arrayBuffer()

    const archive = await createExtractorFromData({ data })
    const entries = Array.from(archive.getFileList().fileHeaders)
      .filter(rarEntryIsPage)
      .sort(sortByAsc('name'))

    const pages = entries.map((entry, index) => ({
      index,
      size: 'single' as ComicPage['size'],
      name: entry.name,
      read: async () => {
        const extracted = archive.extract({ files: [entry.name] })
        const files = Array.from(extracted.files)
        return files[0].extraction
      }
    }))

    return {
      name: file.name,
      pages: pages
    }
  }
}

export function rarEntryIsPage(entry: FileHeader) {
  return entryIsPage({
    name: entry.name,
    isDirectory: entry.flags.directory
  })
}
