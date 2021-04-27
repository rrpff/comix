import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['createCollection']

export const createCollection: R = async (_, { input }, { library }) => {
  return await library.config.createCollection(input)
}
