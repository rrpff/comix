import fs from 'fs/promises'
import { Comic } from '@comix/parser'
import { metadata } from './metadata'
import { fixturePath, fixtureLastModified } from '../../test/helpers'
import { LibraryEntry, MetadataAdapter } from '../protocols'

const subject = async (fpath: string, adapters: MetadataAdapter[] = []) => {
  let lastModified = 0
  try {
    lastModified = (await fs.stat(fpath)).mtimeMs
  } catch {}

  const stat = {
    path: fpath,
    lastModified: lastModified
  }

  return metadata(stat, adapters)
}

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
  const comic = await subject(fixturePath(fname))

  expect(comic).toMatchObject({
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

  const comic = await subject(fixturePath('wytches-sample.cbz'))

  expect(comic.fileLastProcessed).toEqual(now)
})

it('calls the given metadata adapters with the current state', async () => {
  const spyAdapter = { process: jest.fn(async state => ({})) }
  const comic = await subject(fixturePath('wytches-sample.cbz'), [spyAdapter])

  expect(spyAdapter.process.mock.calls[0][0]).toMatchObject({ ...comic, adaptions: [] })
})

it('calls each metadata adapter with the comic archive', async () => {
  // TODO: consider parser DI
  const spyAdapter = { process: jest.fn(async (a, b) => a) }
  await subject(fixturePath('wytches-sample.cbz'), [spyAdapter])

  expect(spyAdapter.process.mock.calls[0][1].name).toEqual('wytches-sample.cbz')
  expect(spyAdapter.process.mock.calls[0][1].images).toBeInstanceOf(Array)
})

it('returns adaptions', async () => {
  const adapter = new RandomCoverAdapter()
  const comic = await subject(fixturePath('wytches-sample.cbz'), [adapter])

  expect(comic.adaptions).toContainEqual({
    source: 'RandomCoverAdapter',
    changes: {
      coverFileName: adapter.randomCoverFileName
    }
  })
})

it('merges state from adapters into the result', async () => {
  const adapter = new RandomCoverAdapter()
  const comic = await subject(fixturePath('wytches-sample.cbz'), [adapter])

  expect(comic.coverFileName).toEqual(adapter.randomCoverFileName)
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
    const comic = await subject(fpath)

    expect(comic.corrupt).toEqual(true)
  })
})

class RandomCoverAdapter implements MetadataAdapter {
  public randomCoverFileName: string

  constructor() {
    this.randomCoverFileName = Math.random().toString()
  }

  async process(_: LibraryEntry) {
    return { coverFileName: this.randomCoverFileName }
  }
}
