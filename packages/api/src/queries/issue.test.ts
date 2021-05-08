import { GraphQLError } from 'graphql'
import { gql } from 'graphql-tag'
import { createTestQueryRunner } from '../../test/helpers'
import { generateCollection, list, generateVolume, generateEntry, generateIssue } from '../../test/generators'
import { Library } from '@comix/library'

const QUERY = gql`
  query run($input: IssueInput!) {
    issue(input: $input) {
      source
      sourceId
      coverDate
      issueNumber
      name
      volume { source, sourceId, name }
      characters { type, source, sourceId, name }
      concepts { type, source, sourceId, name }
      locations { type, source, sourceId, name }
      objects { type, source, sourceId, name }
      people { type, source, sourceId, name, roles }
      storyArcs { type, source, sourceId, name }
      teams { type, source, sourceId, name }
      entries {
        collection { path }
        entry { fileName, filePath, fileLastModified, fileLastProcessed, corrupt, coverFileName }
      }
    }
  }
`

it('returns an error when the issue does not exist', async () => {
  const { run } = await createTestQueryRunner()
  const result = await run(QUERY, { input: { source: 'whatever', sourceId: '123' } })

  expect(result.errors).toContainEqual(
    new GraphQLError(`Issue "whatever:123" does not exist`)
  )
})

it('returns the issue when it exists', async () => {
  const { library, run } = await createTestQueryRunner()
  const collection = await library.config.createCollection(generateCollection())
  const issue = generateIssue()
  const entry = generateEntry({ issue })
  await library.config.setEntry(collection.path, entry.filePath, entry)

  const result = await run(QUERY, { input: { source: issue.source, sourceId: issue.sourceId } })

  expect(result.data!.issue).toMatchObject({
    source: issue.source,
    sourceId: issue.sourceId,
    coverDate: issue.coverDate.toISOString(),
    issueNumber: issue.issueNumber,
    name: issue.name,
    volume: issue.volume ? {
      source: issue.volume.source,
      sourceId: issue.volume.sourceId,
      name: issue.volume.name,
    } : undefined,
    entries: [{
      collection: { path: collection.path },
      entry: {
        corrupt: entry.corrupt,
        coverFileName: entry.coverFileName,
        fileLastModified: entry.fileLastModified,
        fileLastProcessed: entry.fileLastProcessed,
        fileName: entry.fileName,
        filePath: entry.filePath,
      }
    }],
    characters: issue.characters?.map(character => ({
      type: character.type,
      source: character.source,
      sourceId: character.sourceId,
      name: character.name
    })),
    concepts: issue.concepts?.map(concept => ({
      type: concept.type,
      source: concept.source,
      sourceId: concept.sourceId,
      name: concept.name
    })),
    locations: issue.locations?.map(location => ({
      type: location.type,
      source: location.source,
      sourceId: location.sourceId,
      name: location.name
    })),
    objects: issue.objects?.map(object => ({
      type: object.type,
      source: object.source,
      sourceId: object.sourceId,
      name: object.name
    })),
    people: issue.people?.map(person => ({
      type: person.type,
      source: person.source,
      sourceId: person.sourceId,
      name: person.name,
      roles: person.roles,
    })),
    storyArcs: issue.storyArcs?.map(arc => ({
      type: arc.type,
      source: arc.source,
      sourceId: arc.sourceId,
      name: arc.name
    })),
    teams: issue.teams?.map(team => ({
      type: team.type,
      source: team.source,
      sourceId: team.sourceId,
      name: team.name
    })),
  })
})
