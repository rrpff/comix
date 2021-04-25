export interface ComicFileStat {
  path: string
  lastModified: number
}

export interface BaseLibraryEntry {
  fileName: string
  filePath: string
  fileLastModified: number
  fileLastProcessed: number
  corrupt: boolean
}

export interface ProcessedLibraryEntry extends BaseLibraryEntry {
  coverFileName?: string
}

export interface RawLibraryEntry extends BaseLibraryEntry {
  coverData?: ArrayBuffer
}
