import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import faker from 'faker'
import { createTestQueryRunner } from '../../test/helpers'

const QUERY = gql`
  mutation run($input: CollectionCreateInput!) {
    collection: createCollection(input: $input) {
      name
      path
    }
  }
`

it('should create the collection if it does not exist', async () => {
  const { library, run } = await createTestQueryRunner()
  const collection = generateCollection()

  await run(QUERY, { input: collection })

  expect(await library.collections()).toContainEqual(collection)
})

it('should return the collection', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  const result = await run(QUERY, { input: collection })

  expect(result.data!.collection).toEqual(collection)
})

it('should throw an error if it already exists', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  await run(QUERY, { input: collection })
  const result = await run(QUERY, { input: collection })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "${collection.path}" already exists`)
  )
})

const generateCollection = () => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})
