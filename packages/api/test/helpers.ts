import { graphql, DocumentNode, print } from 'graphql'
import { Library, InMemoryLibraryConfig } from '@comix/library'
import { GraphqlContext, RequestContext } from '../src/types'
import { createLoaders } from '../src/loaders'
import schema from '../src/schema'

interface GraphQLRequest {
  query: DocumentNode
  context: GraphqlContext
  variables: object
}

export const graphqlRequest = async ({ query, context, variables }: GraphQLRequest) => {
  return await graphql({
    schema,
    source: print(query),
    contextValue: context,
    variableValues: variables
  })
}

export const createTestQueryRunner = async (overrides: Partial<RequestContext> = {}) => {
  const requestContext = {
    library: new Library(new InMemoryLibraryConfig()),
    ...overrides
  }

  const context = {
    ...requestContext,
    loaders: createLoaders(requestContext)
  }

  return {
    ...requestContext,
    run: async (query: DocumentNode, variables: object = {}) => {
      return await graphqlRequest({ query, context, variables })
    }
  }
}
