import fs from 'fs/promises'
import path from 'path'
import tmp from 'tmp-promise'
import { createExtractorFromFile, createExtractorFromData, Extractor, FileHeader } from 'node-unrar-js'
import { ComicParser, Comic } from '../protocols'
import { entryIsPage, sortByAsc } from '../utils'
import createUnrarWasmBinary from '../wasm/createUnrarWasmBinary'

const TMPDIR = tmp.dirSync()

export class CbrParser implements ComicParser {
  public async parse(input: File | ArrayBuffer | string, name: string): Promise<Comic> {
    const archive: Extractor<Uint8Array | never> = typeof input === 'string'
      ? await createExtractorFromFile({ filepath: input, targetPath: TMPDIR.name })
      : input instanceof ArrayBuffer
      ? await createExtractorFromData({ data: input })
      : await createExtractorFromData({ data: await input.arrayBuffer(), wasmBinary: createUnrarWasmBinary() })

    const entries = Array.from(archive.getFileList().fileHeaders)
      .filter(rarEntryIsPage)
      .sort(sortByAsc('name'))

    const images = entries.map((entry, index) => ({
      index,
      name: entry.name,
      read: async () => {
        const extracted = archive.extract({ files: [entry.name] })
        const files = Array.from(extracted.files)
        const extraction = files[0].extraction

        // When using `createExtractorFromData` then `extraction` will be set,
        // but not when using `createExtractorFromFile`.
        if (extraction) return extraction

        // Instead the file will have been extracted to the TMPDIR.
        const filePath = path.join(TMPDIR.name, files[0].fileHeader.name)
        const buf = await fs.readFile(filePath)
        return buf.buffer
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
