import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['deleteCollection']

export const deleteCollection: R = async (_, { input }, { library, pubsub }) => {
  await library.config.deleteCollection(input.path)

  pubsub.publish('COLLECTION_DELETED', { collectionDeleted: input })

  return { success: true }
}
