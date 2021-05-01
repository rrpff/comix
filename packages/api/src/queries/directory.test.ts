import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import faker from 'faker'
import path from 'path'
import { createTestQueryRunner } from '../../test/helpers'

const QUERY = gql`
  query run($input: DirectoryQuery!) {
    directory(input: $input) {
      name
      path
      directories {
        name
        path
      }
      files {
        name
        path
      }
    }
  }
`

it('errors when requesting a directory that does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const dirpath = path.join(__dirname, faker.system.directoryPath())

  const result = await run(QUERY, { input: { path: dirpath } })

  expect(result.errors).toContainEqual(new GraphQLError(`Unauthorised to access: ${dirpath}`))
})

it('returns the name and path of the directory', async () => {
  const { run, library } = await createTestQueryRunner()
  await library.config.createCollection({ name: 'anything', path: __dirname })

  const result = await run(QUERY, { input: { path: __dirname } })

  expect(result.errors).toBeUndefined()
  expect(result.data).toMatchObject({
    directory: {
      name: path.basename(__dirname),
      path: __dirname,
    }
  })
})

it('errors when requesting a directory that is not a collection path', async () => {
  const { run } = await createTestQueryRunner()
  const dirpath = path.join(__dirname, '..', '..')

  const result = await run(QUERY, { input: { path: dirpath } })

  expect(result.errors).toContainEqual(new GraphQLError(`Unauthorised to access: ${dirpath}`))
})

it('supports requesting a directory that is a subdirectory of a collection path', async () => {
  const { run, library } = await createTestQueryRunner()
  const collectionDir = path.join(__dirname, '..', '..')
  const requestingDir = path.join(collectionDir, 'src', 'queries')

  await library.config.createCollection({ name: 'whatever', path: collectionDir })

  const result = await run(QUERY, { input: { path: requestingDir } })

  expect(result.errors).toBeUndefined()
  expect(result.data).toMatchObject({
    directory: {
      name: 'queries',
      path: requestingDir,
    }
  })
})

it('returns the contents of the directory', async () => {
  const { run, library } = await createTestQueryRunner()
  const collectionDir = path.join(__dirname, '..', '..')

  await library.config.createCollection({ name: 'anything', path: collectionDir })

  const result = await run(QUERY, { input: { path: collectionDir } })

  expect(result.errors).toBeUndefined()

  expect(result.data!.directory.directories).toContainEqual({
    name: 'src', path: path.join(collectionDir, 'src') })

  expect(result.data!.directory.directories).toContainEqual({
    name: 'test', path: path.join(collectionDir, 'test') })

  expect(result.data!.directory.files).toContainEqual({
    name: '.gitignore', path: path.join(collectionDir, '.gitignore') })

  expect(result.data!.directory.files).toContainEqual({
    name: 'jest.config.js', path: path.join(collectionDir, 'jest.config.js') })
})
