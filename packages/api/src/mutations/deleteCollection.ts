import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['deleteCollection']

export const deleteCollection: R = async (_, { input }, { library }) => {
  await library.config.deleteCollection(input.path)
  return { success: true }
}
