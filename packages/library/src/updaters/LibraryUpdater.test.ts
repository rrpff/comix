import { EventEmitter } from 'events'
import { FileDiff } from '@comix/scan-directory'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { Library } from '../lib/Library'
import { ComicCollectionUpdater, ComicLibrary, LibraryCollection, MetadataAdapter } from '../protocols'
import { LibraryUpdater } from './LibraryUpdater'

const subject = () => {
  const collectionUpdater = new SpyCollectionUpdater()
  const config = new InMemoryLibraryConfig()
  const library = new Library(config)
  const updater = new LibraryUpdater(library, { collectionUpdater })
  const diff: FileDiff = { created: [], changed: [], deleted: [] }
  const adapters: MetadataAdapter[] = []

  return { collectionUpdater, config, library, updater, diff, adapters }
}

it('emits an event when all collection updaters are finished', async () => {
  const { updater, diff, adapters } = subject()
  const spy = jest.fn()

  updater.on('finish', spy)
  await updater.run(diff, adapters)

  expect(spy).toHaveBeenCalled()
})

it.each([
  [[{ path: '/comics', name: 'comic' }]],
  [[{ path: '/comics', name: 'comic' }, { path: '/great', name: 'great' }]],
])('calls the collection updater for each collection', async (collections) => {
  expect.assertions(collections.length)

  const { collectionUpdater, library, updater, config, diff, adapters } = subject()

  await Promise.all(collections.map(config.createCollection.bind(config)))
  await updater.run(diff, adapters)

  collections.forEach(collection => {
    expect(collectionUpdater.update).toHaveBeenCalledWith(library, collection, diff, adapters)
  })
})

it('calls each collection updater with a subset of the diff', async () => {
  const { config, collectionUpdater, library, adapters, updater } = subject()

  const collectionA = await config.createCollection({ path: '/a', name: 'a' })
  const collectionB = await config.createCollection({ path: '/b', name: 'b' })

  const diff: FileDiff = {
    created: [{ lastModified: 0, path: '/a/123.cbz' }, { lastModified: 0, path: '/b/123.cbz' }],
    changed: [{ lastModified: 0, path: '/b/456.cbz' }, { lastModified: 0, path: '/a/456.cbz' }],
    deleted: [{ lastModified: 0, path: '/a/789.cbz' }, { lastModified: 0, path: '/b/789.cbz' }],
  }

  const collectionADiff = {
    created: [{ lastModified: 0, path: '/a/123.cbz' }],
    changed: [{ lastModified: 0, path: '/a/456.cbz' }],
    deleted: [{ lastModified: 0, path: '/a/789.cbz' }],
  }

  const collectionBDiff = {
    created: [{ lastModified: 0, path: '/b/123.cbz' }],
    changed: [{ lastModified: 0, path: '/b/456.cbz' }],
    deleted: [{ lastModified: 0, path: '/b/789.cbz' }],
  }

  await updater.run(diff, adapters)

  expect(collectionUpdater.update).toHaveBeenCalledWith(library, collectionA, collectionADiff, adapters)
  expect(collectionUpdater.update).toHaveBeenCalledWith(library, collectionB, collectionBDiff, adapters)
})

it('proxies update events from the collection updater', async () => {
  const { collectionUpdater, updater, diff, adapters } = subject()
  const spy = jest.fn()
  const value = [Math.random(), Math.random(), Math.random()]

  updater.on('update', spy)
  updater.run(diff, adapters)
  collectionUpdater.emit('update', ...value)

  expect(spy).toHaveBeenCalledWith(...value)
})

class SpyCollectionUpdater extends EventEmitter implements ComicCollectionUpdater {
  update = jest.fn(async (_: ComicLibrary, __: LibraryCollection) => {})
}
