import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import faker from 'faker'
import { createTestQueryRunner } from '../../test/helpers'

const QUERY = gql`
  query run($input: CollectionInput!) {
    collection(input: $input) {
      name
      path
    }
  }
`

it('returns an error when there are no collections', async () => {
  const { run } = await createTestQueryRunner()
  const result = await run(QUERY, { input: { path: '/whatever' } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "/whatever" does not exist`)
  )
})

it('returns an error when the collection does not exist', async () => {
  const { library, run } = await createTestQueryRunner()
  const collections = [generateCollection(), generateCollection(), generateCollection()]
  await Promise.all(collections.map(c => library.config.createCollection(c)))

  const collection = generateCollection()
  const result = await run(QUERY, { input: { path: collection.path } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "${collection.path}" does not exist`)
  )
})

it('returns the collection when it exists', async () => {
  const { library, run } = await createTestQueryRunner()
  const collections = [generateCollection(), generateCollection(), generateCollection()]
  await Promise.all(collections.map(c => library.config.createCollection(c)))

  const collection = faker.random.arrayElement(collections)
  const result = await run(QUERY, { input: { path: collection.path } })

  expect(result.data!.collection).toEqual(collection)
})

const generateCollection = () => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})
