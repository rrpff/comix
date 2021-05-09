import { ComicParser, Comic } from '../protocols'
import { CbrParser } from './CbrParser'
import { CbzParser } from './CbzParser'
import { isBrowser } from '../utils'

export class Parser implements ComicParser {
  public async parse(archive: File | ArrayBuffer | string, name: string): Promise<Comic> {
    checkArchiveIsSupported(archive)

    const extension = extname(name)
    switch (extension) {
      case 'cbz': return new CbzParser().parse(archive as any, name)
      case 'cbr': return new CbrParser().parse(archive as any, name)
      default: throw new Error(`Unsupported file type: ${extension}`)
    }
  }
}

function extname(path: string) {
  const parts = path.split('.')
  if (parts.length === 1) return ''

  return parts[parts.length - 1]
}

function checkArchiveIsSupported(archive: File | ArrayBuffer | string) {
  if (typeof archive === 'string' && isBrowser())
    throw new Error('Reading files by file name is only supported in Node.js')
}
