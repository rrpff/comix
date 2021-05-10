import path from 'path'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry, generateReadingProgress, list, pick } from '../../test/generators'
import { LibraryEntry } from '../types/schema'

const QUERY = gql`
  query run($input: EntriesQuery!) {
    entries(input: $input) {
      fileName
      filePath
      fileLastModified
      fileLastProcessed
      corrupt
      coverFileName
      volumeName
      volumeYear

      progress {
        currentPage
        pageCount
        finished
      }
    }
  }
`

it('returns none when there are no entries', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  const { data, errors } = await run(QUERY, { input: { collection: collection.path } })

  expect(errors).toBeUndefined()
  expect(data!.entries).toEqual([])
})

it('returns existing entries', async () => {
  const { library, run } = await createTestQueryRunner()

  const entries = list(generateEntry)
  const collection = await library.config.createCollection(generateCollection())
  await Promise.all(entries.map(e => library.config.setEntry(collection.path, e.filePath, e)))

  const { data, errors } = await run(QUERY, { input: { collection: collection.path } })

  expect(errors).toBeUndefined()
  expectToContainEntries(data!.entries, entries)
})

it('only returns entries within a directory if specified', async () => {
  const { library, run } = await createTestQueryRunner()

  const entries = list(generateEntry).map(e => ({
    ...e,
    filePath: `/whatever/${Math.random()}/${e.fileName}`,
    progress: generateReadingProgress(),
  }))

  const desiredEntry = pick(entries)
  const directoryPath = path.dirname(desiredEntry.filePath)
  const collection = await library.config.createCollection(generateCollection())

  await Promise.all(entries.map(e => library.config.setEntry(collection.path, e.filePath, e)))

  const { data, errors } = await run(QUERY, { input: { collection: collection.path, directoryPath } })

  expect(errors).toBeUndefined()
  expect(data!.entries).toHaveLength(1)
  expectToContainEntries(data!.entries, [desiredEntry])
})

const expectToContainEntries = (list: LibraryEntry[], entries: LibraryEntry[]) => {
  expect(list).toEqual(
    expect.arrayContaining(entries.map(entry =>
      expect.objectContaining({
        fileName: entry.fileName,
        filePath: entry.filePath,
        fileLastModified: entry.fileLastModified,
        fileLastProcessed: entry.fileLastProcessed,
        corrupt: entry.corrupt,
        coverFileName: entry.coverFileName,
        volumeName: entry.volumeName || null,
        volumeYear: entry.volumeYear || null,
        progress: entry.progress || null,
      })
    ))
  )
}
