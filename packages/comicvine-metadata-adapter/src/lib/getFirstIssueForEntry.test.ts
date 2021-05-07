import path from 'path'
import faker from 'faker'
import { InMemoryLibraryConfig, Library } from '@comix/library'
import { generateEntry, generateCollection, generateIssue } from '../../test/generators'
import { getFirstIssueForEntry } from './getFirstIssueForEntry'

it('returns null when there are no sibling entries in the directory', async () => {
  const { library, collection, generateIssueInDirectory } = await setup()

  await generateIssueInDirectory(faker.system.directoryPath())
  await generateIssueInDirectory(faker.system.directoryPath())
  await generateIssueInDirectory(faker.system.directoryPath())

  const entry = generateEntry()
  await library.config.setEntry(collection.path, faker.system.filePath(), entry)

  expect(await getFirstIssueForEntry(library, collection, entry)).toEqual(null)
})

it('returns an issues where the issue number is 1', async () => {
  const { library, collection, generateIssueInDirectory } = await setup()

  const entry = generateEntry()
  const directory = path.dirname(entry.filePath)

  const expected = await generateIssueInDirectory(directory, { issueNumber: 1 })
  await generateIssueInDirectory(directory, { issueNumber: 3 })
  await generateIssueInDirectory(directory, { issueNumber: 2 })
  await generateIssueInDirectory(directory, { issueNumber: 5 })

  expect(await getFirstIssueForEntry(library, collection, entry)).toMatchObject(expected)
})

it('excludes issues where the source is not COMIC_VINE', async () => {
  const { library, collection, generateIssueInDirectory } = await setup()

  const entry = generateEntry()
  const directory = path.dirname(entry.filePath)

  const expected = await generateIssueInDirectory(directory, { source: 'COMIC_VINE', issueNumber: 1 })
  await generateIssueInDirectory(directory, { source: 'WHATEVER', issueNumber: 1 })

  expect(await getFirstIssueForEntry(library, collection, entry)).toMatchObject(expected)
})

it('uses the entry with the closest name when more than one issue is number 1', async () => {
  const { library, collection, generateIssueInDirectory } = await setup()

  const entry = generateEntry({ fileName: 'AAAA 0005.cbz' })
  const directory = path.dirname(entry.filePath)

  await generateIssueInDirectory(directory, { fileName: 'whatever 0001.cbz', issueNumber: 1 })
  const expected = await generateIssueInDirectory(directory, { fileName: 'AAAA 0001.cbz', issueNumber: 1 })

  expect(await getFirstIssueForEntry(library, collection, entry)).toMatchObject(expected)
})

const setup = async () => {
  const library = new Library(new InMemoryLibraryConfig())
  const collection = generateCollection()

  await library.config.createCollection(collection)

  const generateIssueInDirectory = async (directory: string, options: { fileName?: string, source?: string, issueNumber?: number } = {}) => {
    const issue = generateIssue({
      source: options.source || 'COMIC_VINE',
      issueNumber: options.issueNumber || faker.datatype.number()
    })

    const entry = generateEntry({
      filePath: path.join(directory, options.fileName || faker.system.fileName()),
      fileName: options.fileName,
      issue
    })

    await library.config.setEntry(collection.path, entry.filePath, entry)
    return issue
  }

  return {
    library,
    collection,
    generateIssueInDirectory,
  }
}
