import path from 'path'
import Datastore from 'nedb-promises'
import { LibraryCollection, LibraryConfig, LibraryEntry } from '../protocols'

export const DEFAULT_JSON_CONFIG = {
  imagesDirectoryPath: null,
  collections: [],
  entries: {}
}

type SettingDoc = { type: 'setting', key: string, value: any }
type CollectionDoc = { type: 'collection', collection: LibraryCollection }
type EntryDoc = { type: 'entry', collection: string, entry: LibraryEntry }

export class FileLibraryConfig implements LibraryConfig {
  private db: Datastore

  constructor(filePath: string) {
    this.db = Datastore.create({ filename: filePath })
  }

  public async getImagesDirectory(): Promise<string | null> {
    const settings = await this.db.find<SettingDoc>({ type: 'setting', key: 'images-directory' })
    return settings.length > 0 ? settings[0].value : null
  }

  public async setImagesDirectory(path: string): Promise<void> {
    await this.db.remove({ type: 'setting', key: 'images-directory' }, { multi: true })
    await this.db.insert({ type: 'setting', key: 'images-directory', value: path })
  }

  public async getCollection(path: string): Promise<LibraryCollection> {
    const doc = await this.db.findOne<CollectionDoc>({ type: 'collection', 'collection.path': path })
    if (!doc) throw new Error(`Collection "${path}" does not exist`)

    return doc.collection
  }

  public async getCollections(): Promise<LibraryCollection[]> {
    return (await this.db.find<CollectionDoc>({ type: 'collection' })).map(r => r.collection)
  }

  public async createCollection(collection: LibraryCollection): Promise<LibraryCollection> {
    const doc = await this.db.findOne<CollectionDoc>({ type: 'collection', 'collection.path': collection.path })
    if (doc) throw new Error(`Collection "${collection.path}" already exists`)

    return (await this.db.insert<CollectionDoc>({ type: 'collection', collection })).collection
  }

  public async deleteCollection(collectionPath: string): Promise<void> {
    await this.db.remove({ type: 'collection', 'collection.path': collectionPath }, { multi: true })
  }

  public async getEntries(collectionPath: string): Promise<LibraryEntry[]> {
    return (await this.db.find<EntryDoc>({ type: 'entry', collection: collectionPath })).map(r => r.entry)
  }

  public async getEntry(collectionPath: string, entryPath: string): Promise<LibraryEntry> {
    const query = { type: 'entry', collection: collectionPath, 'entry.filePath': entryPath }
    const doc = await this.db.findOne<EntryDoc>(query)
    if (!doc) throw new Error(`Entry "${entryPath}" in "${collectionPath}" does not exist`)

    return doc.entry
  }

  public async setEntry(collectionPath: string, entryPath: string, entry: LibraryEntry): Promise<void> {
    await this.getCollection(collectionPath)
    await this.db.remove({ type: 'entry', collection: collectionPath, 'entry.filePath': entryPath }, { multi: true })
    await this.db.insert<EntryDoc>({ type: 'entry', collection: collectionPath, entry })
  }

  public async deleteEntry(collectionPath: string, entryPath: string): Promise<void> {
    await this.db.remove(
      { type: 'entry', collection: collectionPath, 'entry.filePath': entryPath },
      { multi: true }
    )
  }

  public async updateCollection(originalPath: string, collection: LibraryCollection): Promise<void> {
    const entries = await this.getEntries(originalPath)
    const newEntries = entries.map(entry => {
      const relativePath = path.relative(originalPath, entry.filePath)
      const newPath = path.join(collection.path, relativePath)

      return { ...entry, filePath: newPath }
    })

    await this.db.remove({ type: 'collection', 'collection.path': originalPath }, { multi: true })
    await this.db.remove({ type: 'entry', collection: originalPath }, { multi: true })
    await this.db.insert<CollectionDoc>({ type: 'collection', collection })
    await this.db.insert<EntryDoc[]>(newEntries.map(entry => (
      { type: 'entry', collection: collection.path, entry }
    )))
  }
}
