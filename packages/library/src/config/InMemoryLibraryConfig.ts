import path from 'path'
import { LibraryCollection, LibraryConfig, LibraryEntry } from '../protocols'

export class InMemoryLibraryConfig implements LibraryConfig {
  private config = {
    imagesDirectoryPath: null as string | null,
    collections: [] as LibraryCollection[],
    entries: {} as { [key: string]: { [key: string]: LibraryEntry } }
  }

  public async load(): Promise<LibraryConfig> {
    return this
  }

  public async getImagesDirectory(): Promise<string | null> {
    return this.config.imagesDirectoryPath
  }

  public async setImagesDirectory(path: string): Promise<void> {
    this.config.imagesDirectoryPath = path
  }

  public async getCollection(path: string): Promise<LibraryCollection> {
    const collection = this.config.collections.find(c => c.path === path)
    if (!collection) throw new Error(`Collection "${path}" does not exist`)
    return collection
  }

  public async getCollections(): Promise<LibraryCollection[]> {
    return this.config.collections
  }

  public async createCollection(collection: LibraryCollection): Promise<LibraryCollection> {
    const exists = this.config.collections.some(c => c.path === collection.path)
    if (exists) throw new Error(`Collection "${collection.path}" already exists`)

    this.config.collections.push(collection)
    return collection
  }

  public async deleteCollection(collectionPath: string): Promise<void> {
    delete this.config.entries[collectionPath]
    this.config.collections = this.config.collections.filter(c => c.path !== collectionPath)
  }

  public async getEntries(collectionPath: string): Promise<LibraryEntry[]> {
    return Object.values(this.config.entries[collectionPath] || {})
  }

  public async getEntry(collectionPath: string, entryPath: string): Promise<LibraryEntry> {
    try {
      const entry = this.config.entries[collectionPath][entryPath]
      if (entry === undefined) throw ''
      return entry
    } catch {
      throw new Error(`Entry "${entryPath}" in "${collectionPath}" does not exist`)
    }
  }

  public async setEntry(collectionPath: string, entryPath: string, entry: LibraryEntry): Promise<void> {
    await this.getCollection(collectionPath)
    this.config.entries[collectionPath] = this.config.entries[collectionPath] || {}
    this.config.entries[collectionPath][entryPath] = entry
  }

  public async deleteEntry(collectionPath: string, entryPath: string): Promise<void> {
    if (this.config.entries[collectionPath]) {
      delete this.config.entries[collectionPath][entryPath]
    }
  }

  public async updateCollection(originalPath: string, collection: LibraryCollection): Promise<void> {
    this.config.collections = this.config.collections.map(original => {
      if (original.path === originalPath) return collection
      return original
    })

    this.config.entries[collection.path] = Object.values(this.config.entries[originalPath] || {}).reduce((acc, entry) => {
      const newPath = path.join(collection.path, path.relative(originalPath, entry.filePath))
      const newEntry = { ...entry, filePath: newPath }

      return { ...acc, [newPath]: newEntry }
    }, {})

    delete this.config.entries[originalPath]
  }
}
