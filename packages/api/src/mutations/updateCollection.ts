import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['updateCollection']

export const updateCollection: R = async (_, { input }, { library }) => {
  await library.config.updateCollection(input.path, input.collection)
  return await library.config.getCollection(input.collection.path)
}
