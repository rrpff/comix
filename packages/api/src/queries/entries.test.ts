import path from 'path'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry, list, pick } from '../../test/generators'

const QUERY = gql`
  query run($input: EntriesQuery!) {
    entries(input: $input) {
      fileName
      filePath
      fileLastModified
      fileLastProcessed
      corrupt
      coverFileName
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
  expect(data!.entries).toEqual(
    expect.arrayContaining(entries.map(entry =>
      expect.objectContaining({
        fileName: entry.fileName,
        filePath: entry.filePath,
        fileLastModified: entry.fileLastModified,
        fileLastProcessed: entry.fileLastProcessed,
        corrupt: entry.corrupt,
        coverFileName: entry.coverFileName,
      })
    ))
  )
})

it('only returns entries within a directory if specified', async () => {
  const { library, run } = await createTestQueryRunner()

  const entries = list(generateEntry).map(e => ({ ...e, filePath: `/whatever/${Math.random()}/${e.fileName}` }))
  const desiredEntry = pick(entries)
  const directoryPath = path.dirname(desiredEntry.filePath)
  const collection = await library.config.createCollection(generateCollection())

  await Promise.all(entries.map(e => library.config.setEntry(collection.path, e.filePath, e)))

  const { data, errors } = await run(QUERY, { input: { collection: collection.path, directoryPath } })

  expect(errors).toBeUndefined()
  expect(data!.entries).toHaveLength(1)
  expect(data!.entries).toContainEqual(
    expect.objectContaining({
      fileName: desiredEntry.fileName,
      filePath: desiredEntry.filePath,
      fileLastModified: desiredEntry.fileLastModified,
      fileLastProcessed: desiredEntry.fileLastProcessed,
      corrupt: desiredEntry.corrupt,
      coverFileName: desiredEntry.coverFileName,
    })
  )
})
