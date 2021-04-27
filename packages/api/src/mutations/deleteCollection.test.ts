import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import faker from 'faker'
import { createTestQueryRunner } from '../../test/helpers'

const MUTATION = gql`
  mutation run($input: CollectionDeleteInput!) {
    result: deleteCollection(input: $input) {
      success
    }
  }
`

const SUBSCRIPTION = gql`
  subscription {
    collectionDeleted {
      path
    }
  }
`

it('should do nothing if the collection does not exist', async () => {
  const { run, library } = await createTestQueryRunner()
  const collection = generateCollection()
  await run(MUTATION, { input: { path: collection.path } })

  expect(await library.collections()).toEqual([])
})

it('should remove the collection from the library', async () => {
  const { run, library } = await createTestQueryRunner()
  const collections = [generateCollection(), generateCollection(), generateCollection()]
  await Promise.all(collections.map(c => library.config.createCollection(c)))

  const collection = faker.random.arrayElement(collections)
  await run(MUTATION, { input: { path: collection.path } })

  expect(await library.collections())
    .toEqual(collections.filter(c => c.path !== collection.path))
})

it('should return success', async () => {
  const { run } = await createTestQueryRunner()
  const result = await run(MUTATION, { input: { path: '/whatever' } })

  expect(result.data!.result.success).toEqual(true)
})

it('updates collectionDeleted subscribers', async () => {
  expect.assertions(1)

  const { run, subscribe } = await createTestQueryRunner()
  const collection = generateCollection()

  const subscriber = subscribe(SUBSCRIPTION)
  subscriber.then(async iterator => {
    const { value } = await iterator.next()

    expect(value.data.collectionDeleted.path).toEqual(collection.path)
  })

  await run(MUTATION, { input: { path: collection.path } })
})

const generateCollection = () => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})
