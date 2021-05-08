import { LibraryIssue as ComixIssue } from '@comix/library'
import { GraphqlContext } from '../types'
import { QueryResolvers, LibraryIssue as ApiIssue } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['issue']

export const issue: R = async (_, { input }, { library }) => {
  return mapResult(await library.config.getIssue(input))
}

const mapResult = (issue: ComixIssue): ApiIssue => ({
  source: issue.source,
  sourceId: issue.sourceId,
  coverDate: issue.coverDate,
  issueNumber: issue.issueNumber,
  name: issue.name,
  volume: issue.volume ? {
    source: issue.volume.source,
    sourceId: issue.volume.sourceId,
    name: issue.volume.name,
  } : undefined,
  entries: issue.entries?.map(entry => ({
    collection: { path: entry.collectionPath },
    entry: entry.entry
  })),
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
