import { LibraryVolume as ComixVolume } from '@comix/library'
import { GraphqlContext } from '../types'
import { QueryResolvers, LibraryVolume as ApiVolume } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['volumes']

export const volumes: R = async (_, { input }, { library }) => {
  return mapResults(await library.config.getVolumes(input.collection))
}

const mapResults = (volumes: ComixVolume[]): ApiVolume[] => {
  return volumes.map(volume => ({
    source: volume.source,
    sourceId: volume.sourceId,
    name: volume.name,
  }))
}
