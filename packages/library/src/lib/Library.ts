import { ComicLibrary, LibraryCollection, LibraryConfig, LibraryEntry } from '../protocols'

export class Library implements ComicLibrary {
  private finishLoading: Promise<any> = Promise.resolve()

  constructor(public config: LibraryConfig) {
    this.finishLoading = config.load()
  }

  async collections(): Promise<LibraryCollection[]> {
    await this.finishLoading
    return this.config.getCollections()
  }

  async entries(collectionPath: string): Promise<LibraryEntry[]> {
    await this.finishLoading
    return this.config.getEntries(collectionPath)
  }
}
