import fs from 'fs/promises'
import path from 'path'
import { Comic, Parser } from '@comix/parser'
import { fixturePath } from '../../test/helpers'
import { CoverMetadataAdapter, CoverMetadataAdapterConfig } from './CoverMetadataAdapter'

it.each([
  'small',
  'tiny',
])('saves resized cover files in the given image directory', async (size) => {
  const imageDirectory = fixturePath('outputs')
  const inputComicFilePath = fixturePath('wytches-sample.cbz')
  const { changes } = await subject(inputComicFilePath, { imageDirectory })

  const savedCoverFilePath = path.join(imageDirectory, size, changes.coverFileName!)
  const actualCoverFileData = await fs.readFile(savedCoverFilePath)
  const expectedCoverFileData = await fs.readFile(fixturePath(`wytches-sample-${size}-0001.jpeg`))

  try {
    expect(Buffer.compare(actualCoverFileData, expectedCoverFileData)).toEqual(0)
  } finally {
    await fs.rm(savedCoverFilePath)
  }
})

describe('when the file cannot be parsed', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  it.each([
    fixturePath('fake-comic-file.cbz'),
    fixturePath('folder', 'another-fake-file.cbr'),
  ])('does not generate a cover image', async (fpath) => {
    const { changes } = await subject(fpath)

    expect(changes.coverFileName).toEqual(undefined)
  })
})

const DEFAULT_TEST_CONFIG = {
  imageDirectory: fixturePath('outputs')
}

const subject = async (fpath: string, config: CoverMetadataAdapterConfig = DEFAULT_TEST_CONFIG) => {
  const fname = path.basename(fpath)
  const entry = {
    fileName: fname,
    filePath: fpath,
    fileLastModified: 123,
    fileLastProcessed: 456,
    corrupt: false,
    adaptions: [],
  }

  let comic: Comic | null = null

  try {
    const data = await fs.readFile(fpath)
    const parser = new Parser()
    comic = await parser.parse(Uint8Array.from(data).buffer, fname)
  } catch {
    entry.corrupt = true
  }

  return new CoverMetadataAdapter(config).process(entry, comic)
}
