import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, list, generateVolume, generateEntry, generateIssue, generateReadingProgress } from '../../test/generators'
import { Library } from '@comix/library'

const QUERY = gql`
  query run($input: VolumeInput!) {
    volume(input: $input) {
      source
      sourceId
      name
      issues {
        source
        sourceId
        coverDate
        issueNumber
        name
        entries {
          collection { path }
          entry {
            corrupt
            coverFileName
            fileLastModified
            fileLastProcessed
            fileName
            filePath

            progress {
              currentPage
              pageCount
              finished
            }
          }
        }
      }
    }
  }
`

it('returns an error when the volume does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const result = await run(QUERY, { input: { source: 'whatever', sourceId: '123' } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Volume "whatever:123" does not exist`)
  )
})

it('returns the volume when it exists', async () => {
  const { library, run } = await createTestQueryRunner()
  const { volume, issues } = await createVolumeWithIssues(library)

  const result = await run(QUERY, { input: { source: volume.source, sourceId: volume.sourceId } })

  expect(result.data!.volume).toMatchObject({
    source: volume.source,
    sourceId: volume.sourceId,
    name: volume.name,
    issues: issues.map(issue => ({
      source: issue.source,
      sourceId: issue.sourceId,
      coverDate: issue.coverDate.toISOString(),
      issueNumber: issue.issueNumber,
      name: issue.name,
      entries: issue.entries?.map(entry => ({
        collection: { path: entry.collectionPath },
        entry: {
          corrupt: entry.entry.corrupt,
          coverFileName: entry.entry.coverFileName,
          fileLastModified: entry.entry.fileLastModified,
          fileLastProcessed: entry.entry.fileLastProcessed,
          fileName: entry.entry.fileName,
          filePath: entry.entry.filePath,
          progress: entry.entry.progress
        },
      }))
    }))
  })
})

const createVolumeWithIssues = async (library: Library) => {
  const collection = await library.config.createCollection(generateCollection())
  const volume = generateVolume()
  const issues = list(() => generateIssue({ volume }))
  const entries = issues.map(issue => generateEntry({ issue, progress: generateReadingProgress() }))
  issues.forEach((issue, idx) => issue.entries = [{
    collectionPath: collection.path, entry: entries[idx]
  }])

  await Promise.all(entries.map(async entry => {
    await library.config.setEntry(collection.path, entry.filePath, entry)
  }))

  return { collection, volume, issues }
}
