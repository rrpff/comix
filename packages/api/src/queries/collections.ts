import { GraphqlContext } from '../types'
import { QueryResolvers } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['collections']

export const collections: R = async (_, __, { library }) => {
  return await library.collections()
}
