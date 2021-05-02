import { Request, Response } from 'express'
import { ActionContext } from '../types'
import { LibraryEntry } from '../types/schema'

export const updateLibrary = async (_req: Request, res: Response<any, { context: ActionContext }>) => {
  const updater = res.locals.context.updater
  updater.on('update', (event, path, entry?: LibraryEntry) => {
    if (event === 'create')
      res.locals.context.pubsub.publish('ENTRY_CREATED', { entryCreated: { path, name: entry?.fileName } })

    if (event === 'change')
      res.locals.context.pubsub.publish('ENTRY_UPDATED', { entryUpdated: { path, name: entry?.fileName } })

    if (event === 'delete')
      res.locals.context.pubsub.publish('ENTRY_DELETED', { entryDeleted: { path } })
  })

  updater.run()

  res.json({ started: true })
}
