import { EventEmitter } from 'events'
import { Comic } from '@comix/parser'
import { FileDiff } from '@comix/scan-directory'
import { Library } from '../lib/Library'

export interface MetadataAdapterResult {
  changes: Partial<LibraryEntry>
  defer?: boolean
}

export interface MetadataResult {
  entry: LibraryEntry
  repeat?: boolean
}

export interface MetadataAdaption {
  source: string
  changes: Partial<LibraryEntry>
}

export interface MetadataAdapter {
  process(
    entry: LibraryEntry,
    comic: Comic | null,
    collection: LibraryCollection,
    library: Library,
    deferred: boolean,
  ): Promise<MetadataAdapterResult>
}

export interface LibraryIdentifier {
  source: string
  sourceId: string
}

export interface LibraryVolume {
  source: string
  sourceId: string
  sourceMetadata?: any
  name: string
  issues?: LibraryIssue[]
}

export interface LibraryIssue {
  source: string
  sourceId: string
  sourceMetadata?: any
  volume?: LibraryVolume
  coverDate: Date
  issueNumber: number
  imageUrl?: string
  name?: string
  characters?: LibraryCreditCharacter[]
  concepts?: LibraryCreditConcept[]
  locations?: LibraryCreditLocation[]
  objects?: LibraryCreditObject[]
  people?: LibraryCreditPerson[]
  storyArcs?: LibraryCreditStoryArc[]
  teams?: LibraryCreditTeam[]
  entries?: { collectionPath: string, entry: LibraryEntry }[]
}

export interface LibraryCreditBase {
  source: string
  sourceId: string
  sourceMetadata?: any
  type: string
  name?: string
  issues?: LibraryIssue[]
}

export interface LibraryCreditCharacter extends LibraryCreditBase {
  type: 'character'
}

export interface LibraryCreditConcept extends LibraryCreditBase {
  type: 'concept'
}

export interface LibraryCreditLocation extends LibraryCreditBase {
  type: 'location'
}

export interface LibraryCreditObject extends LibraryCreditBase {
  type: 'object'
}

export interface LibraryCreditPerson extends LibraryCreditBase {
  type: 'person'
  roles: string[]
}

export interface LibraryCreditStoryArc extends LibraryCreditBase {
  type: 'storyArc'
}

export interface LibraryCreditTeam extends LibraryCreditBase {
  type: 'team'
}

export type LibraryCredit =
  | LibraryCreditCharacter
  | LibraryCreditConcept
  | LibraryCreditLocation
  | LibraryCreditObject
  | LibraryCreditPerson
  | LibraryCreditStoryArc
  | LibraryCreditTeam

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

  /**
   * @deprecated Use volume on issue instead
   */
  comicVineVolumeId?: number

  /**
   * @deprecated Use issue instead
   */
  comicVineIssueId?: number

  /**
   * @deprecated Use issue instead
   */
  comicVineIssue?: any

  issue?: LibraryIssue
  progress?: LibraryReadingProgress
}

export interface LibraryEntryAdaption {
  source: string
  changes: Partial<LibraryEntry>
}

export interface LibraryCollection {
  name: string
  path: string
}

export interface LibraryReadingProgress {
  currentPage: number
  pageCount: number
  finished: boolean
}

export interface LibraryConfig {
  getImagesDirectory(): Promise<string | null>
  setImagesDirectory(path: string): Promise<void>
  getCollection(path: string): Promise<LibraryCollection>
  getCollections(): Promise<LibraryCollection[]>
  createCollection(collection: LibraryCollection): Promise<LibraryCollection>
  deleteCollection(collectionPath: string): Promise<void>
  getEntries(collectionPath: string): Promise<LibraryEntry[]>
  getEntry(collectionPath: string, entryPath: string, withIssue?: boolean): Promise<LibraryEntry>
  setEntry(collectionPath: string, entryPath: string, entry: LibraryEntry): Promise<void>
  setReadingProgress(collectionPath: string, entryPath: string, readingProgress?: LibraryReadingProgress): Promise<void>
  deleteEntry(collectionPath: string, entryPath: string): Promise<void>
  updateCollection(collectionPath: string, collection: LibraryCollection): Promise<void>
  getIssue(identifier: LibraryIdentifier, withCredits?: boolean, withVolume?: boolean, withEntries?: boolean): Promise<LibraryIssue>
  getCredit(identifier: LibraryIdentifier, withIssues?: boolean): Promise<LibraryCreditBase>
  getVolume(identifier: LibraryIdentifier, withIssues?: boolean): Promise<LibraryVolume>
  getVolumes(collectionPath: string): Promise<LibraryVolume[]>
  getCharacters(collectionPath: string): Promise<LibraryCreditCharacter[]>
  getConcepts(collectionPath: string): Promise<LibraryCreditConcept[]>
  getLocations(collectionPath: string): Promise<LibraryCreditLocation[]>
  getObjects(collectionPath: string): Promise<LibraryCreditObject[]>
  getPeople(collectionPath: string): Promise<LibraryCreditPerson[]>
  getStoryArcs(collectionPath: string): Promise<LibraryCreditStoryArc[]>
  getTeams(collectionPath: string): Promise<LibraryCreditTeam[]>
}

export interface ComicLibrary {
  config: LibraryConfig
  collections(): Promise<LibraryCollection[]>
  entries(collectionPath: string): Promise<LibraryEntry[]>
}

export interface ComicCollectionUpdater extends EventEmitter {
  update(
    library: ComicLibrary,
    collection: LibraryCollection,
    diff: FileDiff,
    adapters: MetadataAdapter[],
  ): Promise<void>
}
