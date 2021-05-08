import { gql } from 'graphql-tag'
import { Library } from '@comix/library'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, generateEntry, generateIssue, generateVolume, list } from '../../test/generators'

const QUERY = gql`
  query run($input: VolumesQuery!) {
    volumes(input: $input) {
      source
      sourceId
      name
    }
  }
`

it('returns none when there are no volumes', async () => {
  const { run } = await createTestQueryRunner()
  const collection = generateCollection()

  const { data, errors } = await run(QUERY, { input: { collection: collection.path } })

  expect(errors).toBeUndefined()
  expect(data!.volumes).toEqual([])
})

it('returns existing volumes', async () => {
  const { library, run } = await createTestQueryRunner()
  const { collection, volumes } = await createVolumes(library)

  const { data, errors } = await run(QUERY, { input: { collection: collection.path } })

  expect(errors).toBeUndefined()
  expect(data!.volumes).toMatchObject(volumes.map(vol => ({
    source: vol.source,
    sourceId: vol.sourceId,
    name: vol.name,
  })))
})

const createVolumes = async (library: Library) => {
  const collection = await library.config.createCollection(generateCollection())
  const volumes = list(generateVolume)

  await Promise.all(volumes.map(async volume => {
    const issue = generateIssue({ volume })
    const entry = generateEntry({ issue })

    await library.config.setEntry(collection.path, entry.filePath, entry)
  }))

  return { collection, volumes }
}
