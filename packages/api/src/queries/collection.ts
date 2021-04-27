import { GraphqlContext } from '../types'
import { QueryResolvers } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['collection']

export const collection: R = async (_, { input }, { loaders }) => {
  try {
    return await loaders.collections.load(input.path)
  } catch {
    throw new Error(`Collection "${input.path}" does not exist`)
  }
}
