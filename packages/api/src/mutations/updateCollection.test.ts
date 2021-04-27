import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import faker from 'faker'
import { createTestQueryRunner } from '../../test/helpers'

const QUERY = gql`
  mutation run($input: CollectionUpdateInput!) {
    collection: updateCollection(input: $input) {
      name
      path
    }
  }
`

it('should return an error if the collection does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()
  const result = await run(QUERY, { input: { path: collection.path, collection } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "${collection.path}" does not exist`)
  )
})

it('should update the collection', async () => {
  const { library, run } = await createTestQueryRunner()
  const original = generateCollection()
  await library.config.createCollection(original)

  const changed = generateCollection()
  await run(QUERY, { input: { path: original.path, collection: changed } })

  expect(await library.collections()).toContainEqual(changed)
  expect(await library.collections()).not.toContainEqual(original)
})

const generateCollection = () => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})
