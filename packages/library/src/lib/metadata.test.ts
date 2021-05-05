import fs from 'fs/promises'
import { Comic } from '@comix/parser'
import faker from 'faker'
import { metadata } from './metadata'
import { fixturePath, fixtureLastModified } from '../../test/helpers'
import { LibraryCollection, LibraryEntry, MetadataAdapter } from '../protocols'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { Library } from './Library'

it.each([
  fixturePath('whatever.cbr'),
  fixturePath('cool.cbr'),
])('throws an error if the file does not exist', async (fpath) => {
  await expect(subject(fpath)).rejects
    .toEqual(new Error(`File does not exist: ${fpath}`))
})

it.each([
  'wytches-sample.cbz',
  'phonogram-sample.cbr',
])('returns metadata about the file', async (fname) => {
  const { output } = await subject(fixturePath(fname))

  expect(output).toMatchObject({
    fileName: fname,
    filePath: fixturePath(fname),
    fileLastModified: await fixtureLastModified(fname),
    corrupt: false,
  })
})

it('returns a last processed time of now for the file', async () => {
  const now = Math.random() * 100000

  jest.useFakeTimers('modern')
  jest.setSystemTime(now)

  const { output } = await subject(fixturePath('wytches-sample.cbz'))

  expect(output.fileLastProcessed).toEqual(now)
})

it('calls the given metadata adapters with the entry, comic archive, collection and library', async () => {
  const spyAdapter = { process: jest.fn(async (a, b, c, d) => a) }
  const { output, collection, library } = await subject(fixturePath('wytches-sample.cbz'), [spyAdapter])

  const [
    receivedEntry,
    receivedComicArchive,
    receivedCollection,
    receivedLibrary,
  ] = spyAdapter.process.mock.calls[0]

  expect(receivedEntry).toMatchObject({ ...output, adaptions: [] })
  expect(receivedComicArchive.name).toEqual('wytches-sample.cbz')
  expect(receivedComicArchive.images).toBeInstanceOf(Array)
  expect(receivedCollection).toEqual(collection)
  expect(receivedLibrary).toEqual(library)
})

it('returns adaptions', async () => {
  const adapter = new RandomCoverAdapter()
  const { output } = await subject(fixturePath('wytches-sample.cbz'), [adapter])

  expect(output.adaptions).toContainEqual({
    source: 'RandomCoverAdapter',
    changes: {
      coverFileName: adapter.randomCoverFileName
    }
  })
})

it('merges state from adapters into the result', async () => {
  const adapter = new RandomCoverAdapter()
  const { output } = await subject(fixturePath('wytches-sample.cbz'), [adapter])

  expect(output.coverFileName).toEqual(adapter.randomCoverFileName)
})

it('calls adapters sequentially with updated state', async () => {
  const randomAdapter = new RandomCoverAdapter()
  const spyAdapter = { process: jest.fn(async (a, b) => a) }
  await subject(fixturePath('wytches-sample.cbz'), [randomAdapter, spyAdapter])

  const call = spyAdapter.process.mock.calls[0]

  expect(call[0]).toMatchObject({
    coverFileName: randomAdapter.randomCoverFileName
  })
})

describe('when the file cannot be parsed', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it.each([
    fixturePath('fake-comic-file.cbz'),
    fixturePath('folder', 'another-fake-file.cbr'),
  ])('marks the file corrupt', async (fpath) => {
    const { output } = await subject(fpath)

    expect(output.corrupt).toEqual(true)
  })
})

const subject = async (fpath: string, adapters: MetadataAdapter[] = []) => {
  let lastModified = 0
  try {
    lastModified = (await fs.stat(fpath)).mtimeMs
  } catch {}

  const stat = {
    path: fpath,
    lastModified: lastModified
  }

  const library = new Library(new InMemoryLibraryConfig())
  const collection: LibraryCollection = {
    name: faker.lorem.sentence(),
    path: faker.system.filePath(),
  }

  const output = await metadata(stat, adapters, collection, library)

  return { output, library, collection }
}

class RandomCoverAdapter implements MetadataAdapter {
  public randomCoverFileName: string

  constructor() {
    this.randomCoverFileName = Math.random().toString()
  }

  async process(_: LibraryEntry) {
    return { coverFileName: this.randomCoverFileName }
  }
}
