import { createExtractorFromData, Extractor, FileHeader } from 'node-unrar-js'
import { ComicParser, Comic } from '../protocols'
import { entryIsPage, sortByAsc } from '../utils'
import createUnrarWasmBinary from '../wasm/createUnrarWasmBinary'

export class CbrParser implements ComicParser {
  public async parse(input: File | ArrayBuffer, name: string): Promise<Comic> {
    const data = input instanceof ArrayBuffer ? input : await input.arrayBuffer()

    const archive: Extractor<Uint8Array> = input instanceof ArrayBuffer
      ? await createExtractorFromData({ data })
      : await createExtractorFromData({ data, wasmBinary: createUnrarWasmBinary() })

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
      name: name,
      images: images
    }
  }
}

function rarEntryIsPage(entry: FileHeader) {
  return entryIsPage({
    name: entry.name,
    isDirectory: entry.flags.directory
  })
}
