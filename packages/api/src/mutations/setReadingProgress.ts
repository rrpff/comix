import { GraphqlContext } from '../types'
import { MutationResolvers } from '../types/schema'

type R = MutationResolvers<GraphqlContext>['setReadingProgress']

export const setReadingProgress: R = async (_, { input }, { library }) => {
  await library.config.setReadingProgress(input.collection, input.entry, input.progress || undefined)

  return { success: true }
}
