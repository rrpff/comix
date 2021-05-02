import { LibraryUpdater } from '@comix/library'
import { Request, Response } from 'express'
import { PubSub } from 'apollo-server-express'
import { mock } from 'jest-mock-extended'
import { EventEmitter } from 'events'
import faker from 'faker'
import { ActionContext } from '../types'
import { updateLibrary } from './updateLibrary'
import { createUpdateLibraryListener } from '../listeners/createUpdateLibraryListener'

it('responds that it started', () => {
  const { res, call } = subject()

  call({})

  expect(res.json).toHaveBeenCalledWith({ started: true })
})

it('starts the updater in context', () => {
  const { context, call } = subject()

  call({})

  expect(context.updater.run).toHaveBeenCalled()
})

it('dispatches ENTRY_CREATED events on entry creates', () => {
  const { context, call } = subject()
  const filePath = faker.system.filePath()
  const fileName = faker.system.fileName()

  call({})

  context.updater.emit('update', 'create', filePath, { fileName })
  expect(context.pubsub.publish).toHaveBeenCalledWith('ENTRY_CREATED', { entryCreated: { path: filePath, name: fileName } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

it('dispatches ENTRY_UPDATED events on entry changes', () => {
  const { context, call } = subject()
  const filePath = faker.system.filePath()
  const fileName = faker.system.fileName()

  call({})

  context.updater.emit('update', 'change', filePath, { fileName })
  expect(context.pubsub.publish).toHaveBeenCalledWith('ENTRY_UPDATED', { entryUpdated: { path: filePath, name: fileName } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

it('dispatches ENTRY_DELETED events on entry deletions', () => {
  const { context, call } = subject()
  const filePath = faker.system.filePath()
  const fileName = faker.system.fileName()

  call({})

  context.updater.emit('update', 'delete', filePath, { fileName })
  expect(context.pubsub.publish).toHaveBeenCalledWith('ENTRY_DELETED', { entryDeleted: { path: filePath } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

it('dispatches an LIBRARY_UPDATE_FINISHED event on finish', () => {
  const { context, call } = subject()

  call({})

  context.updater.emit('finish')
  expect(context.pubsub.publish).toHaveBeenCalledWith('LIBRARY_UPDATE_FINISHED', { libraryUpdateFinished: { success: true } })
  expect(context.pubsub.publish).toHaveBeenCalledTimes(1)
})

let removeListener: () => void
afterEach(() => removeListener())

const subject = () => {
  const context = {} as ActionContext
  context.updater = mock<LibraryUpdater>(new EventEmitter() as LibraryUpdater)
  context.pubsub = mock<PubSub>()

  removeListener = createUpdateLibraryListener(context.updater, context.pubsub)

  const res: any = {
    locals: { context },
    json: jest.fn(() => res),
  }

  const call = async (req: Partial<Request>) => {
    return await updateLibrary(req as Request, res as Response<any, { context: ActionContext }>)
  }

  return { context, res, call }
}
