import { EventEmitter } from 'events'
import { FileStat, FileDiff } from '@comix/scan-directory'
import { ComicCollectionUpdater, ComicLibrary, LibraryCollection, LibraryEntry, MetadataAdapter } from '../protocols'
import { metadata } from '../lib/metadata'

interface CollectionUpdaterConfig {
  getMetadataForFile: (stat: FileStat, repeated: boolean) => Promise<{ repeat?: boolean, entry: LibraryEntry }>
}

export class CollectionUpdater extends EventEmitter implements ComicCollectionUpdater {
  constructor(private config: Partial<CollectionUpdaterConfig> = {}) {
    super()
  }

  public async update(library: ComicLibrary, collection: LibraryCollection, diff: FileDiff, adapters: MetadataAdapter[]): Promise<void> {
    const defaults: CollectionUpdaterConfig = {
      getMetadataForFile(stat, repeated) {
        return metadata(stat, [...adapters], collection, library, repeated)
      }
    }

    const getMetadata = this.config.getMetadataForFile || defaults.getMetadataForFile

    const repeatedFiles: string[] = []
    const hasRepeated = (stat: FileStat) => repeatedFiles.includes(stat.path)

    await sequence(diff.created, async stat => {
      try {
        const state = await getMetadata(stat, hasRepeated(stat))
        await library.config.setEntry(collection.path, stat.path, state.entry)

        if (state.repeat && !hasRepeated(stat)) {
          repeatedFiles.push(stat.path)
          diff.created.push(stat)
        } else {
          this.emit('update', 'create', stat.path, state.entry)
        }
      } catch (e) {
        console.error(e)
      }
    })

    await sequence(diff.changed, async stat => {
      try {
        const state = await getMetadata(stat, hasRepeated(stat))
        await library.config.setEntry(collection.path, stat.path, state.entry)

        if (state.repeat && !hasRepeated(stat)) {
          repeatedFiles.push(stat.path)
          diff.changed.push(stat)
        } else {
          this.emit('update', 'change', stat.path, state.entry)
        }
      } catch (e) {
        console.error(e)
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
