import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection } from '../../test/generators'

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
