import { LibraryVolume as ComixVolume } from '@comix/library'
import { GraphqlContext } from '../types'
import { QueryResolvers, LibraryVolume as ApiVolume } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['volume']

export const volume: R = async (_, { input }, { library }) => {
  return mapResult(await library.config.getVolume(input))
}

const mapResult = (volume: ComixVolume): ApiVolume => ({
  source: volume.source,
  sourceId: volume.sourceId,
  name: volume.name,
  issues: volume.issues?.map(issue => ({
    source: issue.source,
    sourceId: issue.sourceId,
    coverDate: issue.coverDate,
    issueNumber: issue.issueNumber,
    name: issue.name,
  }))
})
