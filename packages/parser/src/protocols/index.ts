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

export interface ComicParser {
  parse(file: File): Promise<Comic>
}

export interface ArchiveEntry {
  name: string
  isDirectory: boolean
}
