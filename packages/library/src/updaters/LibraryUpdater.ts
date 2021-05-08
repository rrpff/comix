import { EventEmitter } from 'events'
import { FileDiff } from '@comix/scan-directory'
import isSubdir from 'is-subdir'
import { ComicCollectionUpdater, ComicLibrary, MetadataAdapter } from '../protocols'
import { CollectionUpdater } from './CollectionUpdater'

const defaults: LibraryUpdaterConfig = {
  collectionUpdater: new CollectionUpdater()
}

export interface LibraryUpdaterConfig {
  collectionUpdater: ComicCollectionUpdater
}

export class LibraryUpdater extends EventEmitter {
  private config: LibraryUpdaterConfig

  constructor(private library: ComicLibrary, config: Partial<LibraryUpdaterConfig> = {}) {
    super()

    this.config = { ...defaults, ...config }
    this.config.collectionUpdater.on('update', (...args) => {
      this.emit('update', ...args)
    })
  }

  async run(diff: FileDiff, adapters: MetadataAdapter[]) {
    const collections = await this.library.collections()
    await Promise.all(collections.map(async collection => {
      const collectionDiff = diffSubset(diff, collection.path)
      await this.config.collectionUpdater.update(
        this.library,
        collection,
        collectionDiff,
        adapters
      )
    }))

    this.emit('finish')
  }
}

const diffSubset = (diff: FileDiff, path: string): FileDiff => {
  return {
    created: diff.created.filter(stat => isSubdir(path, stat.path)),
    changed: diff.changed.filter(stat => isSubdir(path, stat.path)),
    deleted: diff.deleted.filter(stat => isSubdir(path, stat.path)),
  }
}
