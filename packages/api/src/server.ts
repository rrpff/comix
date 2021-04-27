import http from 'http'
import { ApolloServer, PubSub } from 'apollo-server-express'
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
  const pubsub = new PubSub()

  const context = (): GraphqlContext => {
    const requestContext = { library }

    return {
      ...requestContext,
      loaders: createLoaders(requestContext),
      pubsub: pubsub
    }
  }

  const apollo = new ApolloServer({
    schema,
    context
  })

  const server = http.createServer(app)
  apollo.applyMiddleware({ app, path: '/graphql' })
  apollo.installSubscriptionHandlers(server)

  return server
}
