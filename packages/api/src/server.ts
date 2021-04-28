import http from 'http'
import { ApolloServer, PubSub } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'
import { Library } from '@comix/library'
import schema from './schema'
import { GraphqlContext } from './types'
import { createLoaders } from './loaders'

interface ServerOptions {
  library: Library
}

export default async ({ library }: ServerOptions) => {
  const app = express()
  const pubsub = new PubSub()

  app.use(cors())

  const imagesDirectory = await library.config.getImagesDirectory()
  app.use('/assets/images', express.static(imagesDirectory!))

  const collections = await library.collections()
  collections.forEach(collection =>
    app.use(`/collections${collection.path}`, express.static(collection.path))
  )

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
