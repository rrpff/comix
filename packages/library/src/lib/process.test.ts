import path from 'path'
import fs from 'fs/promises'
import { metadata } from './metadata'
import { ProcessedLibraryEntry, RawLibraryEntry } from '../protocols'
import { fixturePath } from '../../test/helpers'
import { ProcessConfig, process } from './process'

const defaultTestConfig = {
  imageDirectory: fixturePath('outputs')
}

const subject = async (entry: RawLibraryEntry, overrides: Partial<ProcessConfig> = {}) => {
  const config = { ...defaultTestConfig, ...overrides }
  return await process(entry, config)
}

it('retains all base entry properties', async () => {
  const entry = createEntry()
  const processed = await subject(entry)

  expect(processed).toEqual<ProcessedLibraryEntry>(entry)
})

it('returns no cover file name if no cover data is given', async () => {
  const entry = createEntry({ coverData: undefined })
  const processed = await subject(entry)

  expect(processed.coverFileName).toEqual(undefined)
})

it.each([
  fixturePath('outputs'),
  fixturePath('outputs', 'nested'),
])('saves a cover file in the given image directory', async (imageDirectory) => {
  const inputComicFilePath = fixturePath('wytches-sample.cbz')

  const entry = await metadata({ path: inputComicFilePath, lastModified: 0 })
  const processed = await subject(entry, { imageDirectory })

  const savedCoverFilePath = path.join(imageDirectory, processed.coverFileName!)
  const actualCoverFileData = await fs.readFile(savedCoverFilePath)
  const expectedCoverFileData = await fs.readFile(fixturePath('wytches-sample', '0001.jpeg'))

  try {
    expect(Buffer.compare(actualCoverFileData, expectedCoverFileData)).toEqual(0)
  } finally {
    await fs.rm(savedCoverFilePath)
  }
})

it('saves the correct cover file in the given image directory', async () => {
  const imageDirectory = fixturePath('outputs')
  const inputComicFilePath = fixturePath('wytches-sample.cbz')

  const entry = await metadata({ path: inputComicFilePath, lastModified: 0 })
  const processed = await subject(entry, { imageDirectory })

  const savedCoverFilePath = path.join(imageDirectory, processed.coverFileName!)
  const actualCoverFileData = await fs.readFile(savedCoverFilePath)
  const wrongCoverFileData = await fs.readFile(fixturePath('wytches-sample', '0002.jpeg'))

  try {
    expect(Buffer.compare(actualCoverFileData, wrongCoverFileData)).toEqual(-1)
  } finally {
    await fs.rm(savedCoverFilePath)
  }
})

const createEntry = (overrides: Partial<RawLibraryEntry> = {}): RawLibraryEntry => ({
  fileName: 'wytches-sample.cbz',
  filePath: fixturePath('wytches-sample.cbz'),
  fileLastModified: 123,
  fileLastProcessed: 456,
  corrupt: false,
  coverData: undefined,
  ...overrides
})
