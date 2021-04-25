import { ComicParser, Comic } from '../protocols'
import { CbrParser } from './CbrParser'
import { CbzParser } from './CbzParser'

export class Parser implements ComicParser {
  public async parse(archive: File | ArrayBuffer, name: string): Promise<Comic> {
    const extension = extname(name)
    switch (extension) {
      case 'cbz': return new CbzParser().parse(archive, name)
      case 'cbr': return new CbrParser().parse(archive, name)
      default: throw new Error(`Unsupported file type: ${extension}`)
    }
  }
}

function extname(path: string) {
  const parts = path.split('.')
  if (parts.length === 1) return ''

  return parts[parts.length - 1]
}
