import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry } from '../../test/generators'

const NESTED_EXAMPLE = {
  collectionRoot: '/a',
  entries: [{ path: '/a/b/c/0001.cbr' }, { path: '/a/b/x/001.cz' }],
  data: [
    { directory: ['b', 'c'] },
    { directory: ['b', 'x'] },
  ],
}

const MULTI_FILE_EXAMPLE = {
  collectionRoot: '/',
  entries: [
    { path: '/ms-marvel/0001.cbr' },
    { path: '/spider-man/0001.cbr' },
  ],
  data: [
    { directory: ['ms-marvel'] },
    { directory: ['spider-man'] },
  ],
}

const QUERY = gql`
  query run($input: CollectionInput!) {
    collectionDirectories(input: $input) {
      directory
    }
  }
`

it('errors when requesting a collection that does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  const result = await run(QUERY, { input: { path: collection.path } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "${collection.path}" does not exist`)
  )
})

it.each([
  NESTED_EXAMPLE,
  MULTI_FILE_EXAMPLE,
])('returns a tree of the collection\'s entries\' directories', async ({ collectionRoot, entries, data }) => {
  const { run, library } = await createTestQueryRunner()

  await library.config.createCollection({ name: 'anything', path: collectionRoot })
  await Promise.all(entries.map(entry =>
    library.config.setEntry(collectionRoot, entry.path, { ...generateEntry(), filePath: entry.path })
  ))

  const result = await run(QUERY, { input: { path: collectionRoot } })

  expect(result.errors).toBeUndefined()
  expect(result.data!.collectionDirectories).toMatchObject(data)
})
