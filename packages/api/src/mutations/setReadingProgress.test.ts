import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry, generateReadingProgress } from '../../test/generators'
import { GraphQLError } from 'graphql'

const MUTATION = gql`
  mutation run($input: SetReadingProgressInput!) {
    result: setReadingProgress(input: $input) {
      success
    }
  }
`

it('should return an error when an entry does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const result = await run(MUTATION, { input: { collection: '/whatever', entry: '/whatever/file.cbr' } })

  expect(result.errors).toContainEqual(
    new GraphQLError('Entry "/whatever/file.cbr" in "/whatever" does not exist')
  )
})

it('should return success', async () => {
  const { run, library } = await createTestQueryRunner()
  const collection = generateCollection()
  const entry = generateEntry()

  await library.config.createCollection(collection)
  await library.config.setEntry(collection.path, entry.filePath, entry)

  const result = await run(MUTATION, {
    input: {
      collection: collection.path,
      entry: entry.filePath,
      progress: undefined
    }
  })

  expect(result.errors).toBeUndefined()
  expect(result.data!.result.success).toEqual(true)
})

it('should update reading progress on an entry', async () => {
  const { run, library } = await createTestQueryRunner()
  const collection = generateCollection()
  const entry = generateEntry()

  await library.config.createCollection(collection)
  await library.config.setEntry(collection.path, entry.filePath, entry)

  const progress = generateReadingProgress()
  const result = await run(MUTATION, {
    input: {
      collection: collection.path,
      entry: entry.filePath,
      progress: progress
    }
  })

  expect(result.errors).toBeUndefined()

  const retrieved = await library.config.getEntry(collection.path, entry.filePath)
  expect(retrieved.progress).toEqual(progress)
})

it('should update resetting progress on an entry', async () => {
  const { run, library } = await createTestQueryRunner()
  const collection = generateCollection()
  const entry = generateEntry()

  await library.config.createCollection(collection)
  await library.config.setEntry(collection.path, entry.filePath, entry)

  const result = await run(MUTATION, {
    input: {
      collection: collection.path,
      entry: entry.filePath,
      progress: undefined
    }
  })

  expect(result.errors).toBeUndefined()

  const retrieved = await library.config.getEntry(collection.path, entry.filePath)
  expect(retrieved.progress).toBeUndefined()
})
