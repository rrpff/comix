import { Request, Response } from 'express'
import { ActionContext } from '../types'
import { LibraryEntry } from '../types/schema'

export const updateLibrary = async (_req: Request, res: Response<any, { context: ActionContext }>) => {
  const updater = res.locals.context.updater

  const updateListener = (event: string, path: string, entry?: LibraryEntry) => {
    if (event === 'create')
      res.locals.context.pubsub.publish('ENTRY_CREATED', { entryCreated: { path, name: entry?.fileName } })

    if (event === 'change')
      res.locals.context.pubsub.publish('ENTRY_UPDATED', { entryUpdated: { path, name: entry?.fileName } })

    if (event === 'delete')
      res.locals.context.pubsub.publish('ENTRY_DELETED', { entryDeleted: { path } })
  }

  const finishListener = () => {
    res.locals.context.pubsub.publish('LIBRARY_UPDATE_FINISHED', { libraryUpdateFinished: { success: true } })
    updater.removeListener('finish', finishListener)
  }

  updater.on('update', updateListener)
  updater.on('finish', finishListener)

  updater.run()

  res.json({ started: true })
}
