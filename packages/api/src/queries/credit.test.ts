import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry, generateIssue, generateCredit, generatePersonCredit, generateReadingProgress } from '../../test/generators'

const queryFor = (type: { resolver: string, additionalFields: string }) => gql`
  query run($input: CreditInput!) {
    ${type.resolver}(input: $input) {
      type
      source
      sourceId
      name
      ${type.additionalFields}
      issues {
        source
        sourceId
        volume { source, sourceId, name }
        coverDate
        issueNumber
        name
        entries {
          collection { path }
          entry {
            fileName
            filePath
            fileLastModified
            fileLastProcessed
            corrupt
            coverFileName
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

const CREDIT_TYPES = [
  {
    plural: 'characters',
    resolver: 'characterCredit',
    additionalFields: '',
    generate: () => generateCredit({ type: 'character' })
  },
  {
    plural: 'concepts',
    resolver: 'conceptCredit',
    additionalFields: '',
    generate: () => generateCredit({ type: 'concept' })
  },
  {
    plural: 'locations',
    resolver: 'locationCredit',
    additionalFields: '',
    generate: () => generateCredit({ type: 'location' })
  },
  {
    plural: 'objects',
    resolver: 'objectCredit',
    additionalFields: '',
    generate: () => generateCredit({ type: 'object' })
  },
  {
    plural: 'people',
    resolver: 'personCredit',
    additionalFields: 'roles\n',
    generate: () => generatePersonCredit()
  },
  {
    plural: 'storyArcs',
    resolver: 'storyArcCredit',
    additionalFields: '',
    generate: () => generateCredit({ type: 'storyArc' })
  },
  {
    plural: 'teams',
    resolver: 'teamCredit',
    additionalFields: '',
    generate: () => generateCredit({ type: 'team' })
  },
]

it.each(CREDIT_TYPES)('returns an error when the credit does not exist', async (type) => {
  const { run } = await createTestQueryRunner()
  const query = queryFor(type)
  const result = await run(query, { input: { source: 'whatever', sourceId: '123' } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Credit "whatever:123" does not exist`)
  )
})

it.each(CREDIT_TYPES)('returns the credit when it exists', async (type) => {
  const { library, run } = await createTestQueryRunner()
  const collection = await library.config.createCollection(generateCollection())

  const credit = type.generate()
  const issue = generateIssue({ [type.plural]: [credit] })
  const entry = generateEntry({ issue })
  await library.config.setEntry(collection.path, entry.filePath, entry)

  const query = queryFor(type)
  const result = await run(query, { input: { source: credit.source, sourceId: credit.sourceId } })

  expect(result.errors).toBeUndefined()
  expect(result.data![type.resolver]).toMatchObject({
    ...credit,
    issues: [{
      source: issue.source,
      sourceId: issue.sourceId,
      coverDate: issue.coverDate.toISOString(),
      issueNumber: issue.issueNumber,
      name: issue.name,
      volume: issue.volume ? {
        source: issue.volume.source,
        sourceId: issue.volume.sourceId,
        name: issue.volume.name,
      } : undefined
    }]
  })
})

it.each(CREDIT_TYPES)('returns the entry for each issue, with reading progress', async (type) => {
  const { library, run } = await createTestQueryRunner()
  const collection = await library.config.createCollection(generateCollection())

  const credit = type.generate()
  const issue = generateIssue({ [type.plural]: [credit] })
  const entry = generateEntry({ issue, progress: generateReadingProgress() })
  await library.config.setEntry(collection.path, entry.filePath, entry)

  const query = queryFor(type)
  const result = await run(query, { input: { source: credit.source, sourceId: credit.sourceId } })

  expect(result.errors).toBeUndefined()
  expect(result.data![type.resolver]).toMatchObject({
    ...credit,
    issues: [{
      entries: [{
        collection: { path: collection.path },
        entry: {
          fileName: entry.fileName,
          filePath: entry.filePath,
          fileLastModified: entry.fileLastModified,
          fileLastProcessed: entry.fileLastProcessed,
          corrupt: entry.corrupt,
          coverFileName: entry.coverFileName,
          progress: entry.progress,
        }
      }]
    }]
  })
})
