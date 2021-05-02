import { LibraryEntry, LibraryUpdater } from '@comix/library'
import { PubSub } from 'apollo-server-express'

export const createUpdateLibraryListener = (updater: LibraryUpdater, pubsub: PubSub) => {
  const updateListener = (event: string, path: string, entry?: LibraryEntry) => {
    if (event === 'create')
      pubsub.publish('ENTRY_CREATED', { entryCreated: { path, name: entry?.fileName } })

    if (event === 'change')
      pubsub.publish('ENTRY_UPDATED', { entryUpdated: { path, name: entry?.fileName } })

    if (event === 'delete')
      pubsub.publish('ENTRY_DELETED', { entryDeleted: { path } })
  }

  const finishListener = () => {
    pubsub.publish('LIBRARY_UPDATE_FINISHED', { libraryUpdateFinished: { success: true } })
  }

  updater.on('update', updateListener)
  updater.on('finish', finishListener)

  return () => {
    updater.removeAllListeners()
  }
}
