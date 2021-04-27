import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import faker from 'faker'
import { createTestQueryRunner } from '../../test/helpers'

const QUERY = gql`
  mutation run($input: CollectionDeleteInput!) {
    result: deleteCollection(input: $input) {
      success
    }
  }
`

it('should do nothing if the collection does not exist', async () => {
  const { run, library } = await createTestQueryRunner()
  const collection = generateCollection()
  await run(QUERY, { input: { path: collection.path } })

  expect(await library.collections()).toEqual([])
})

it('should remove the collection from the library', async () => {
  const { run, library } = await createTestQueryRunner()
  const collections = [generateCollection(), generateCollection(), generateCollection()]
  await Promise.all(collections.map(c => library.config.createCollection(c)))

  const collection = faker.random.arrayElement(collections)
  await run(QUERY, { input: { path: collection.path } })

  expect(await library.collections())
    .toEqual(collections.filter(c => c.path !== collection.path))
})

it('should return success', async () => {
  const { run, library } = await createTestQueryRunner()
  const result = await run(QUERY, { input: { path: '/whatever' } })

  expect(result.data!.result.success).toEqual(true)
})

const generateCollection = () => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})
