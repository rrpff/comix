import fs from 'fs/promises'
import { unzip, Reader, ZipEntry } from 'unzipit'
import { entryIsPage, sortByAsc } from '../utils'
import { ComicParser, Comic } from '../protocols'

export class CbzParser implements ComicParser {
  public async parse(input: File | ArrayBuffer | string, name: string): Promise<Comic> {
    const archive = typeof input === 'string'
      ? await unzip(new NodeFileReader(input))
      : await unzip(input)

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
      name: name,
      images: images
    }
  }
}

class NodeFileReader implements Reader {
  private length?: number

  constructor(private fname: string) {}

  public async getLength() {
    if (this.length === undefined) {
      const stat = await fs.stat(this.fname)
      this.length = stat.size
    }

    return this.length!
  }

  async read(offset: number, length: number) {
    const fd = await fs.open(this.fname, 'r')
    const data = new Uint8Array(length)

    await fd.read(data, 0, length, offset)
    await fd.close()

    return data
  }
}

function zipEntryIsPage(entry: ZipEntry) {
  return entryIsPage({
    name: entry.name,
    isDirectory: entry.isDirectory
  })
}
