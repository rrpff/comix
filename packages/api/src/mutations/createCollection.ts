import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['createCollection']

export const createCollection: R = async (_, { input }, { pubsub, library }) => {
  const collection = await library.config.createCollection(input)

  pubsub.publish('COLLECTION_CREATED', { collectionCreated: collection })

  return collection
}
