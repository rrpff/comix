import { EventEmitter } from 'events'
import { FileStat, FileDiff } from '@comix/scan-directory'
import { ComicCollectionUpdater, ComicLibrary, LibraryCollection, LibraryEntry } from '../protocols'

interface CollectionUpdaterConfig {
  getMetadataForFile: (stat: FileStat) => Promise<LibraryEntry>
  scanDirectory: (dir: string) => FileStat[]
  diffFiles: (now: FileStat[], then: FileStat[]) => FileDiff
}

export class CollectionUpdater extends EventEmitter implements ComicCollectionUpdater {
  constructor(private config: CollectionUpdaterConfig) {
    super()
  }

  public async update(library: ComicLibrary, collection: LibraryCollection): Promise<void> {
    const files = this.config.scanDirectory(collection.path)
    const diff = this.config.diffFiles(files, [])

    await Promise.all(diff.created.map(async stat => {
      const entry = await this.config.getMetadataForFile(stat)
      await library.config.setEntry(collection.path, stat.path, entry)
      this.emit('update', 'create', stat.path, entry)
    }))

    await Promise.all(diff.changed.map(async stat => {
      const entry = await this.config.getMetadataForFile(stat)
      await library.config.setEntry(collection.path, stat.path, entry)
      this.emit('update', 'change', stat.path, entry)
    }))

    await Promise.all(diff.deleted.map(async stat => {
      await library.config.deleteEntry(collection.path, stat.path)
      this.emit('update', 'delete', stat.path)
    }))
  }
}
