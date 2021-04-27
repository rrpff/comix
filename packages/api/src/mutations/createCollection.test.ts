import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection } from '../../test/generators'

const MUTATION = gql`
  mutation run($input: CollectionCreateInput!) {
    collection: createCollection(input: $input) {
      name
      path
    }
  }
`

const SUBSCRIPTION = gql`
  subscription {
    collectionCreated {
      name
      path
    }
  }
`

it('should create the collection if it does not exist', async () => {
  const { library, run } = await createTestQueryRunner()
  const collection = generateCollection()

  await run(MUTATION, { input: collection })

  expect(await library.collections()).toContainEqual(collection)
})

it('should return the collection', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  const result = await run(MUTATION, { input: collection })

  expect(result.data!.collection).toEqual(collection)
})

it('should throw an error if it already exists', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  await run(MUTATION, { input: collection })
  const result = await run(MUTATION, { input: collection })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "${collection.path}" already exists`)
  )
})

it('updates collectionCreated subscribers', async () => {
  expect.assertions(1)

  const { run, subscribe } = await createTestQueryRunner()
  const collection = generateCollection()

  const subscription = subscribe(SUBSCRIPTION)

  subscription.then(async iterator => {
    const { value } = await iterator.next()
    expect(value.data.collectionCreated).toEqual(collection)
  })

  await run(MUTATION, { input: collection })
})
