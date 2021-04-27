import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection } from '../../test/generators'

const MUTATION = gql`
  mutation run($input: CollectionUpdateInput!) {
    collection: updateCollection(input: $input) {
      name
      path
    }
  }
`

const SUBSCRIPTION = gql`
  subscription {
    collectionUpdated {
      path
      collection {
        name
        path
      }
    }
  }
`

it('should return an error if the collection does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()
  const result = await run(MUTATION, { input: { path: collection.path, collection } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Collection "${collection.path}" does not exist`)
  )
})

it('should update the collection', async () => {
  const { library, run } = await createTestQueryRunner()
  const original = generateCollection()
  await library.config.createCollection(original)

  const changed = generateCollection()
  await run(MUTATION, { input: { path: original.path, collection: changed } })

  expect(await library.collections()).toContainEqual(changed)
  expect(await library.collections()).not.toContainEqual(original)
})

it('updates collectionUpdated subscribers', async () => {
  expect.assertions(1)

  const { run, subscribe } = await createTestQueryRunner()
  const collection = generateCollection()

  const subscriber = subscribe(SUBSCRIPTION)
  subscriber.then(async iterator => {
    const { value } = await iterator.next()

    expect(value.data.collectionUpdated).toEqual({
      path: collection.path,
      collection
    })
  })

  await run(MUTATION, { input: { path: collection.path, collection } })
})
