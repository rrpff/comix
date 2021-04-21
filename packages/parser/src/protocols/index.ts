export interface ComicImage {
  index: number
  name: string
  read: () => Promise<ArrayBuffer>
}

export interface Comic {
  name: string
  images: ComicImage[]
}

export interface ComicPage {
  type: 'single' | 'double'
  imageWidth: number
  imageHeight: number
  imageIndex: number
  imageName: string
  image: ArrayBuffer
}

export interface ComicParser {
  parse(file: File): Promise<Comic>
}

export interface ComicReader {
  comic: Comic
  current?: ComicPage[]
  currentIndex?: number
  previous: () => Promise<void>
  next: () => Promise<void>
  goto: (imageIndex: number) => Promise<void>
  on: (event: string, handler: (...args: any[]) => void) => void
}

export interface ArchiveEntry {
  name: string
  isDirectory: boolean
}
