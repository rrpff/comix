import { EventEmitter } from 'events'
import { ComicCollectionUpdater, ComicLibrary } from '../protocols'

export interface LibraryUpdaterConfig {
  collectionUpdater: ComicCollectionUpdater
}

export class LibraryUpdater extends EventEmitter {
  constructor(private library: ComicLibrary, private config: LibraryUpdaterConfig) {
    super()

    this.config.collectionUpdater.on('update', (...args) => {
      this.emit('update', ...args)
    })
  }

  async run() {
    const collections = await this.library.collections()
    await Promise.all(collections.map(async collection => {
      await this.config.collectionUpdater.update(this.library, collection)
    }))

    this.emit('finish')
  }
}
