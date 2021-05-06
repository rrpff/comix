import { EventEmitter } from 'events'
import { FileStat, FileDiff } from '@comix/scan-directory'
import { ComicCollectionUpdater, ComicLibrary, LibraryCollection, LibraryEntry } from '../protocols'

interface CollectionUpdaterConfig {
  getMetadataForFile: (stat: FileStat) => Promise<{ repeat?: boolean, entry: LibraryEntry }>
  scanDirectory: (dir: string, knownFiles: FileStat[]) => Promise<FileDiff>
}

export class CollectionUpdater extends EventEmitter implements ComicCollectionUpdater {
  constructor(private config: CollectionUpdaterConfig) {
    super()
  }

  public async update(library: ComicLibrary, collection: LibraryCollection): Promise<void> {
    const repeatedFiles: string[] = []
    const knownFiles = (await library.config.getEntries(collection.path))
      .map(entry => ({ path: entry.filePath, lastModified: entry.fileLastModified }))

    const diff = await this.config.scanDirectory(collection.path, knownFiles)

    const hasRepeated = (stat: FileStat) => repeatedFiles.includes(stat.path)

    await sequence(diff.created, async stat => {
      const state = await this.config.getMetadataForFile(stat)
      await library.config.setEntry(collection.path, stat.path, state.entry)

      if (state.repeat && !hasRepeated(stat)) {
        repeatedFiles.push(stat.path)
        diff.created.push(stat)
      } else {
        this.emit('update', 'create', stat.path, state.entry)
      }
    })

    await sequence(diff.changed, async stat => {
      const state = await this.config.getMetadataForFile(stat)
      await library.config.setEntry(collection.path, stat.path, state.entry)

      if (state.repeat && !hasRepeated(stat)) {
        repeatedFiles.push(stat.path)
        diff.changed.push(stat)
      } else {
        this.emit('update', 'change', stat.path, state.entry)
      }
    })

    await sequence(diff.deleted, async stat => {
      await library.config.deleteEntry(collection.path, stat.path)
      this.emit('update', 'delete', stat.path)
    })
  }
}

async function sequence<T, U>(items: U[], handle: (item: U) => Promise<T>) {
  let remaining = items

  while (remaining.length > 0) {
    await handle(remaining.shift()!)
  }
}
