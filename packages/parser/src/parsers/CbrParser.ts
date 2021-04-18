import { createExtractorFromData, FileHeader } from 'node-unrar-js'
import { ComicParser, Comic } from '../protocols'
import { entryIsPage, sortByAsc } from '../utils'
import createUnrarWasmBinary from '../wasm/createUnrarWasmBinary'

export class CbrParser implements ComicParser {
  public async parse(file: File): Promise<Comic> {
    const wasmBinary = createUnrarWasmBinary()
    const data = await file.arrayBuffer()

    const archive = await createExtractorFromData({ data, wasmBinary })
    const entries = Array.from(archive.getFileList().fileHeaders)
      .filter(rarEntryIsPage)
      .sort(sortByAsc('name'))

    const images = entries.map((entry, index) => ({
      index,
      name: entry.name,
      read: async () => {
        const extracted = archive.extract({ files: [entry.name] })
        const files = Array.from(extracted.files)
        return files[0].extraction
      }
    }))

    return {
      name: file.name,
      images: images
    }
  }
}

export function rarEntryIsPage(entry: FileHeader) {
  return entryIsPage({
    name: entry.name,
    isDirectory: entry.flags.directory
  })
}
