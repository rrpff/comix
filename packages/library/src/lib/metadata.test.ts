import fs from 'fs/promises'
import { metadata } from './metadata'
import { fixturePath, fixtureLastModified } from '../../test/helpers'

const subject = async (fpath: string) => {
  let lastModified = 0
  try {
    lastModified = (await fs.stat(fpath)).mtimeMs
  } catch {}

  return metadata({
    path: fpath,
    lastModified: lastModified
  })
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
