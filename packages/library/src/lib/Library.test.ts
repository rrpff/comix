import { LibraryConfig, LibraryEntry } from '../protocols'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { Library } from './Library'

const subject = (overrideConfig?: LibraryConfig) => {
  const config = overrideConfig || new InMemoryLibraryConfig()
  const library = new Library(config)

  return { library, config }
}

it('exposes its config', () => {
  const { library, config } = subject()

  expect(library.config).toEqual(config)
})

it.each([
  [[]],
  [[{ path: '/comics', name: 'comics' }]],
  [[{ path: '/stuff', name: 'stuff' }, { path: '/great', name: 'great' }]],
])('returns collections from its config', async (collections) => {
  const { library, config } = subject()
  config.getCollections = jest.fn(async () => collections)

  expect(await library.collections()).toEqual(collections)
})

it.each([
  '/', '/comics'
])('returns entries from its config', async (collectionPath) => {
  const { library, config } = subject()
  const entry = { coverFileName: Math.random().toString() } as LibraryEntry
  config.getEntries = jest.fn(async () => [entry])

  expect(await library.entries(collectionPath)).toContainEqual(entry)
  expect(config.getEntries).toHaveBeenCalledWith(collectionPath)
})
