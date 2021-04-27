import { graphql, print, subscribe, DocumentNode, ExecutionResult } from 'graphql'
import { PubSub } from 'apollo-server-express'
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

export const graphqlSubscribe = async ({ query, context, variables }: GraphQLRequest) => {
  return await subscribe({
    schema,
    document: query,
    contextValue: context,
    variableValues: variables
  })
}

export const createTestQueryRunner = async (overrides: Partial<RequestContext> = {}) => {
  const requestContext = {
    library: new Library(new InMemoryLibraryConfig()),
    pubsub: new PubSub(),
    ...overrides
  }

  const context = {
    ...requestContext,
    loaders: createLoaders(requestContext)
  }

  return {
    ...requestContext,
    run: async (query: DocumentNode, variables: object = {}) => {
      // Always wait for the next tick before running any mutations.
      // This is because subscriptions aren't set up if you run the
      // mutation immediately. By the time the subscription is ready
      // the mutation has already run, and any tests just time out.
      //
      // Not sure if this is an issue in this repo, or in Apollo, or
      // in graphql-js...
      await new Promise(resolve => process.nextTick(resolve))
      return await graphqlRequest({ query, context, variables })
    },
    subscribe: (query: DocumentNode, variables: object = {}) => {
      return graphqlSubscribe({ query, context, variables }) as
        Promise<AsyncIterableIterator<ExecutionResult<{ [key: string]: any }>>>
    },
  }
}
