import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['updateCollection']

export const updateCollection: R = async (_, { input }, { library, pubsub }) => {
  await library.config.updateCollection(input.path, input.collection)

  pubsub.publish('COLLECTION_UPDATED', { collectionUpdated: input })

  return await library.config.getCollection(input.collection.path)
}
