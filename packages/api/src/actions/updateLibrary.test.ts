import { InMemoryLibraryConfig, Library, LibraryUpdater } from '@comix/library'
import { Request, Response } from 'express'
import { PubSub } from 'apollo-server-express'
import { mock } from 'jest-mock-extended'
import { EventEmitter } from 'events'
import faker from 'faker'
import { ActionContext } from '../types'
import { updateLibrary } from './updateLibrary'
import { createUpdateLibraryListener } from '../listeners/createUpdateLibraryListener'
import { fixturePath } from '../../test/helpers'

it('responds that it started', async () => {
  const { res, call } = await subject()

  await call({})

  expect(res.json).toHaveBeenCalledWith({ started: true })
})

it('starts the updater in context', async () => {
  const { context, call } = await subject()

  await call({})

  expect(context.updater.run).toHaveBeenCalled()
})

it('returns an error if an image directory has not been set', async () => {
  const { context, call, res } = await subject()
  context.library = new Library(new InMemoryLibraryConfig())

  await call({})

  expect(res.status).toHaveBeenCalledWith(422)
  expect(res.json).toHaveBeenCalledWith({ error: 'Library image directory is not set' })
})

it('dispatches ENTRY_CREATED events on entry creates', async () => {
  const { context, call } = await subject()
  const filePath = faker.system.filePath()
  const fileName = faker.system.fileName()

  await call({})

  context.updater.emit('update', 'create', filePath, { fileName })
  expect(context.pubsub.publish).toHaveBeenCalledWith('ENTRY_CREATED', { entryCreated: { path: filePath, name: fileName } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

it('dispatches ENTRY_UPDATED events on entry changes', async () => {
  const { context, call } = await subject()
  const filePath = faker.system.filePath()
  const fileName = faker.system.fileName()

  await call({})

  context.updater.emit('update', 'change', filePath, { fileName })
  expect(context.pubsub.publish).toHaveBeenCalledWith('ENTRY_UPDATED', { entryUpdated: { path: filePath, name: fileName } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

it('dispatches ENTRY_DELETED events on entry deletions', async () => {
  const { context, call } = await subject()
  const filePath = faker.system.filePath()
  const fileName = faker.system.fileName()

  await call({})

  context.updater.emit('update', 'delete', filePath, { fileName })
  expect(context.pubsub.publish).toHaveBeenCalledWith('ENTRY_DELETED', { entryDeleted: { path: filePath } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

it('dispatches an LIBRARY_UPDATE_FINISHED event on finish', async () => {
  const { context, call } = await subject()

  await call({})

  context.updater.emit('finish')
  expect(context.pubsub.publish).toHaveBeenCalledWith('LIBRARY_UPDATE_FINISHED', { libraryUpdateFinished: { success: true } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

let removeListener: () => void
afterEach(() => removeListener())

const subject = async () => {
  const context = {} as ActionContext
  context.library = new Library(new InMemoryLibraryConfig())
  await context.library.config.setImagesDirectory(fixturePath('outputs'))

  context.updater = mock<LibraryUpdater>(new EventEmitter() as LibraryUpdater)
  context.pubsub = mock<PubSub>()

  removeListener = createUpdateLibraryListener(context.updater, context.pubsub)

  const res: any = {
    locals: { context },
    json: jest.fn(() => res),
    status: jest.fn(() => res),
  }

  const call = async (req: Partial<Request>) => {
    return await updateLibrary(req as Request, res as Response<any, { context: ActionContext }>)
  }

  return { context, res, call }
}
