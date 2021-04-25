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

export interface LibraryCollection {
  name: string
  path: string
}

export interface LibraryConfig {
  load(): Promise<LibraryConfig>
  getImagesDirectory(): Promise<string>
  setImagesDirectory(path: string): Promise<void>
  getCollection(path: string): Promise<LibraryCollection>
  getCollections(): Promise<LibraryCollection[]>
  createCollection(collection: LibraryCollection): Promise<LibraryCollection>
  deleteCollection(collectionPath: string): Promise<void>
  getEntries(collectionPath: string): Promise<ProcessedLibraryEntry[]>
  getEntry(collectionPath: string, entryPath: string): Promise<ProcessedLibraryEntry>
  setEntry(collectionPath: string, entryPath: string, entry: ProcessedLibraryEntry): Promise<void>
  deleteEntry(collectionPath: string, entryPath: string): Promise<void>
  updateCollection(collectionPath: string, collection: LibraryCollection): Promise<void>
}

