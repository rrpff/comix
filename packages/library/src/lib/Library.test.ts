import { LibraryConfig, LibraryEntry } from '../protocols'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { Library } from './Library'

it('exposes its config', () => {
  const config = new InMemoryLibraryConfig()
  const library = new Library(config)

  expect(library.config).toEqual(config)
})

it.each([
  (l: Library) => l.collections(),
  (l: Library) => l.entries('/whatever'),
])('ensures config is loaded before access', (access) => {
  const config = new InMemoryLibraryConfig()
  config.load = jest.fn(() => null)

  access(new Library(config))

  expect(config.load).toHaveReturned()
})

it.each([
  [[]],
  [[{ path: '/comics', name: 'comics' }]],
  [[{ path: '/stuff', name: 'stuff' }, { path: '/great', name: 'great' }]],
])('returns collections from its config', async (collections) => {
  const config = new InMemoryLibraryConfig()
  const library = new Library(config)
  config.getCollections = jest.fn(async () => collections)

  expect(await library.collections()).toEqual(collections)
})

it.each([
  '/', '/comics'
])('returns entries from its config', async (collectionPath) => {
  const config = new InMemoryLibraryConfig()
  const library = new Library(config)
  const entry = { coverFileName: Math.random().toString() } as LibraryEntry
  config.getEntries = jest.fn(async () => [entry])

  expect(await library.entries(collectionPath)).toContainEqual(entry)
  expect(config.getEntries).toHaveBeenCalledWith(collectionPath)
})
