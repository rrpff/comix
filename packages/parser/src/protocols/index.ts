import EventEmitter from 'eventemitter3'

export interface ComicImage {
  index: number
  name: string
  read(): Promise<ArrayBuffer>
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
  parse(archive: File | ArrayBuffer | string, name: string): Promise<Comic>
}

export interface ComicReaderEvents {
  'change': [pages: ComicPage[]]
  'cache:add': [page: ComicPage]
  'cache:remove': [page: ComicPage]
}

export interface ComicReader extends EventEmitter<ComicReaderEvents> {
  comic: Comic
  current?: ComicPage[]
  currentIndex?: number
  pageCount?: number
  previous(): Promise<void>
  next(): Promise<void>
  goto(imageIndex: number): Promise<void>
}

export interface ArchiveEntry {
  name: string
  isDirectory: boolean
}
