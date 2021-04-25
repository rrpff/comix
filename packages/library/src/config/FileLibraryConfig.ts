import path from 'path'
import lowdb, { LowdbAsync } from 'lowdb'
import FileASync from 'lowdb/adapters/FileAsync'
import { LibraryCollection, LibraryConfig, ProcessedLibraryEntry } from '../protocols'

export const DEFAULT_JSON_CONFIG = {
  imagesDirectoryPath: null,
  collections: [],
  entries: {}
}

interface JsonConfig {
  imagesDirectoryPath: string
  collections: LibraryCollection[]
  entries: {
    [key: string]: {
      [key: string]: ProcessedLibraryEntry
    }
  }
}

export class FileLibraryConfig implements LibraryConfig {
  public db?: LowdbAsync<JsonConfig>

  constructor(private filePath: string) {}

  public async load() {
    const adapter = new FileASync<JsonConfig>(this.filePath)
    this.db = await lowdb(adapter)
    await this.db.defaults(DEFAULT_JSON_CONFIG).write()
    await this.db.read()
    return this
  }

  public async getImagesDirectory(): Promise<string> {
    return this.db!.get('imagesDirectoryPath').value()
  }

  public async setImagesDirectory(path: string): Promise<void> {
    this.db!.set('imagesDirectoryPath', path).write()
  }

  public async getCollections(): Promise<LibraryCollection[]> {
    return this.db!.get('collections').value()
  }

  public async getCollection(path: string): Promise<LibraryCollection> {
    const collection = this.db!.get('collections').find(c => c.path === path).value()
    if (!collection) throw new Error(`Collection "${path}" does not exist`)
    return collection
  }

  public async createCollection(collection: LibraryCollection): Promise<LibraryCollection> {
    this.db!.get('collections').push({ ...collection }).write()

    const entries = this.db!.get('entries').get(collection.path).value()
    if (entries === undefined) this.db!.get('entries').set(collection.path, {}).write()

    return collection
  }

  public async deleteCollection(collectionPath: string): Promise<void> {
    this.db!.get('collections').remove(c => c.path === collectionPath).write()
    this.db!.get('entries').unset([collectionPath]).write()
  }

  public async getEntry(collectionPath: string, entryPath: string): Promise<ProcessedLibraryEntry> {
    const entry = this.db!.get('entries').get([collectionPath]).get(entryPath).value()
    if (entry === undefined) throw new Error(`Entry "${entryPath}" in "${collectionPath}" does not exist`)
    return entry
  }

  public async getEntries(collectionPath: string): Promise<ProcessedLibraryEntry[]> {
    return this.db!.get('entries').get([collectionPath]).values().value()
  }

  public async setEntry(collectionPath: string, entryPath: string, entry: ProcessedLibraryEntry): Promise<void> {
    await this.getCollection(collectionPath)
    this.db!.get('entries').get([collectionPath]).set([entryPath], entry).write()
  }

  public async deleteEntry(collectionPath: string, entryPath: string): Promise<void> {
    this.db!.get('entries').get([collectionPath]).unset([entryPath]).write()
  }

  public async updateCollection(originalPath: string, collection: LibraryCollection): Promise<void> {
    const entries = await this.getEntries(originalPath)
    const newEntries = entries.reduce((acc, entry) => {
      const relativePath = path.relative(originalPath, entry.filePath)
      const newPath = path.join(collection.path, relativePath)
      const newEntry = { ...entry, filePath: newPath }

      return { ...acc, [newPath]: newEntry }
    }, {})

    this.db!.get('collections')
      .find(c => c.path === originalPath)
      .assign({ ...collection })
      .write()

    this.db!.get('entries')
      .set([collection.path], newEntries)
      .write()

    this.db!.get('entries')
      .unset([originalPath])
      .write()
  }
}
