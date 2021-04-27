import { ApolloServer } from 'apollo-server-express'
import express from 'express'
import { Library } from '@comix/library'
import schema from './schema'
import { GraphqlContext } from './types'
import { createLoaders } from './loaders'

interface ServerOptions {
  library: Library
}

export default ({ library }: ServerOptions) => {
  const app = express()

  const context = (): GraphqlContext => {
    const requestContext = { library }

    return {
      ...requestContext,
      loaders: createLoaders(requestContext),
    }
  }

  const apollo = new ApolloServer({
    schema,
    context
  })

  apollo.applyMiddleware({ app, path: '/graphql' })

  return app
}
