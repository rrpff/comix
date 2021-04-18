export interface ComicImage {
  index: number
  name: string
  read: () => Promise<ArrayBuffer>
}

export interface Comic {
  name: string
  images: ComicImage[]
}

export interface ComicParser {
  parse(file: File): Promise<Comic>
}

export interface ArchiveEntry {
  name: string
  isDirectory: boolean
}
