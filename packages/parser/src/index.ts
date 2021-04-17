import { ComicParser, Comic } from './protocols'
import { CbrParser } from './parsers/CbrParser'
import { CbzParser } from './parsers/CbzParser'

export * from './protocols'
export { CbrParser } from './parsers/CbrParser'
export { CbzParser } from './parsers/CbzParser'

export class Parser implements ComicParser {
  public async parse(file: File): Promise<Comic> {
    const extension = extname(file.name)
    switch (extension) {
      case 'cbz': return new CbzParser().parse(file)
      case 'cbr': return new CbrParser().parse(file)
      default: throw new Error(`Unsupported file type: ${extension}`)
    }
  }
}

function extname(path: string) {
  const parts = path.split('.')
  if (parts.length === 1) return ''

  return parts[parts.length - 1]
}
