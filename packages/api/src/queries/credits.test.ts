import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry, generateIssue, generateCredit, generatePersonCredit, list } from '../../test/generators'

const queryFor = (type: { resolver: string, additionalFields: string }) => gql`
  query run($input: CreditQuery!) {
    ${type.resolver}(input: $input) {
      type
      source
      sourceId
      name
      ${type.additionalFields}
    }
  }
`

const CREDIT_TYPES = [
  {
    plural: 'characters',
    resolver: 'characterCredits',
    additionalFields: '',
    generate: () => generateCredit({ type: 'character' })
  },
  {
    plural: 'concepts',
    resolver: 'conceptCredits',
    additionalFields: '',
    generate: () => generateCredit({ type: 'concept' })
  },
  {
    plural: 'locations',
    resolver: 'locationCredits',
    additionalFields: '',
    generate: () => generateCredit({ type: 'location' })
  },
  {
    plural: 'objects',
    resolver: 'objectCredits',
    additionalFields: '',
    generate: () => generateCredit({ type: 'object' })
  },
  {
    plural: 'people',
    resolver: 'personCredits',
    additionalFields: 'roles\n',
    generate: () => generatePersonCredit()
  },
  {
    plural: 'storyArcs',
    resolver: 'storyArcCredits',
    additionalFields: '',
    generate: () => generateCredit({ type: 'storyArc' })
  },
  {
    plural: 'teams',
    resolver: 'teamCredits',
    additionalFields: '',
    generate: () => generateCredit({ type: 'team' })
  },
]

it.each(CREDIT_TYPES)('returns none when there are no credits', async (type) => {
  const { library, run } = await createTestQueryRunner()
  const collection = await library.config.createCollection(generateCollection())

  const query = queryFor(type)
  const { data, errors } = await run(query, { input: { collection: collection.path } })

  expect(errors).toBeUndefined()
  expect(data![type.resolver]).toEqual([])
})


it.each(CREDIT_TYPES)('returns existing credits when it exists', async (type) => {
  const { library, run } = await createTestQueryRunner()
  const collection = await library.config.createCollection(generateCollection())

  const credits = list(type.generate)
  const issues = credits.map(credit => generateIssue({ [type.plural]: [credit] }))
  const entries = issues.map(issue => generateEntry({ issue }))
  await Promise.all(entries.map(entry => library.config.setEntry(collection.path, entry.filePath, entry)))

  const query = queryFor(type)
  const result = await run(query, { input: { collection: collection.path } })

  expect(result.errors).toBeUndefined()
  expect(result.data![type.resolver]).toMatchObject(credits)
})
