import { EventEmitter } from 'events'
import { Comic } from '@comix/parser'

export interface MetadataAdapter {
  process(entry: LibraryEntry, comic: Comic | null): Promise<Partial<LibraryEntry>>
}

export interface LibraryEntry {
  fileName: string
  filePath: string
  fileLastModified: number
  fileLastProcessed: number
  corrupt: boolean
  adaptions: LibraryEntryAdaption[]

  coverFileName?: string

  /**
   * @deprecated Look up via Comic Vine volume instead
   */
  volumeName?: string

  /**
   * @deprecated Look up via Comic Vine volume instead
   */
  volumeYear?: number

  comicVineVolumeId?: number
  comicVineIssueId?: number
}

export interface LibraryEntryAdaption {
  source: string
  changes: Partial<LibraryEntry>
}

export interface LibraryCollection {
  name: string
  path: string
}

export interface LibraryConfig {
  getImagesDirectory(): Promise<string | null>
  setImagesDirectory(path: string): Promise<void>
  getCollection(path: string): Promise<LibraryCollection>
  getCollections(): Promise<LibraryCollection[]>
  createCollection(collection: LibraryCollection): Promise<LibraryCollection>
  deleteCollection(collectionPath: string): Promise<void>
  getEntries(collectionPath: string): Promise<LibraryEntry[]>
  getEntry(collectionPath: string, entryPath: string): Promise<LibraryEntry>
  setEntry(collectionPath: string, entryPath: string, entry: LibraryEntry): Promise<void>
  deleteEntry(collectionPath: string, entryPath: string): Promise<void>
  updateCollection(collectionPath: string, collection: LibraryCollection): Promise<void>
}

export interface ComicLibrary {
  config: LibraryConfig
  collections(): Promise<LibraryCollection[]>
  entries(collectionPath: string): Promise<LibraryEntry[]>
}

export interface ComicLibraryUpdater extends EventEmitter {
  update(library: ComicLibrary): Promise<void>
}

export interface ComicCollectionUpdater extends EventEmitter {
  update(library: ComicLibrary, collection: LibraryCollection): Promise<void>
}
