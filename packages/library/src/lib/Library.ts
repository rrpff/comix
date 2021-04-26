import { ComicLibrary, LibraryCollection, LibraryConfig, LibraryEntry } from '../protocols'

export class Library implements ComicLibrary {
  constructor(public config: LibraryConfig) {}

  async collections(): Promise<LibraryCollection[]> {
    return this.config.getCollections()
  }

  async entries(collectionPath: string): Promise<LibraryEntry[]> {
    return this.config.getEntries(collectionPath)
  }
}
