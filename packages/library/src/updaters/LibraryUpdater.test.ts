import { EventEmitter } from 'events'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { Library } from '../lib/Library'
import { ComicCollectionUpdater, ComicLibrary, LibraryCollection } from '../protocols'
import { LibraryUpdater } from './LibraryUpdater'

const subject = () => {
  const collectionUpdater = new SpyCollectionUpdater()
  const config = new InMemoryLibraryConfig()
  const library = new Library(config)
  const updater = new LibraryUpdater(library, { collectionUpdater })

  return { collectionUpdater, config, library, updater }
}

it('emits an event when all collection updaters are finished', async () => {
  const { updater } = subject()
  const spy = jest.fn()

  updater.on('finish', spy)
  await updater.run()

  expect(spy).toHaveBeenCalled()
})

it.each([
  [[{ path: '/comics', name: 'comic' }]],
  [[{ path: '/comics', name: 'comic' }, { path: '/great', name: 'great' }]],
])('calls the collection updater for each collection', async (collections) => {
  expect.assertions(collections.length)

  const { collectionUpdater, library, updater, config } = subject()

  await Promise.all(collections.map(config.createCollection.bind(config)))
  await updater.run()

  collections.forEach(collection => {
    expect(collectionUpdater.update).toHaveBeenCalledWith(library, collection)
  })
})

it('proxies change events from the collection updater', async () => {
  const { collectionUpdater, updater } = subject()
  const spy = jest.fn()
  const value = [Math.random(), Math.random(), Math.random()]

  updater.on('change', spy)
  updater.run()
  collectionUpdater.emit('change', ...value)

  expect(spy).toHaveBeenCalledWith(...value)
})

class SpyCollectionUpdater extends EventEmitter implements ComicCollectionUpdater {
  update = jest.fn(async (_: ComicLibrary, __: LibraryCollection) => {})
}
