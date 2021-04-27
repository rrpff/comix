import { gql } from 'graphql-tag'
import faker from 'faker'
import { createTestQueryRunner } from '../../test/helpers'

const QUERY = gql`
  query run {
    collections {
      name
      path
    }
  }
`

it('returns none when no collections exist', async () => {
  const { run } = await createTestQueryRunner()
  const { data } = await run(QUERY)

  expect(data!.collections).toEqual([])
})

it('returns existing collections', async () => {
  const { library, run } = await createTestQueryRunner()
  const collection = await library.config.createCollection(generateCollection())

  const { data } = await run(QUERY)

  expect(data!.collections).toEqual([collection])
})

const generateCollection = () => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})
