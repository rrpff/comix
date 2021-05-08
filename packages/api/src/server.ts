import http from 'http'
import { ApolloServer, PubSub } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'
import { Library, LibraryUpdater } from '@comix/library'
import schema from './schema'
import { ActionContext, GraphqlContext } from './types'
import { createLoaders } from './loaders'
import { updateLibrary } from './actions/updateLibrary'
import { collectionFiles } from './actions/collectionFiles'
import { createUpdateLibraryListener } from './listeners/createUpdateLibraryListener'

interface ServerOptions {
  library: Library
}

export default async ({ library }: ServerOptions) => {
  const updater = new LibraryUpdater(library)

  const app = express()
  const pubsub = new PubSub()

  createUpdateLibraryListener(updater, pubsub)

  app.use(cors())

  const imagesDirectory = await library.config.getImagesDirectory()
  app.use('/assets/images', express.static(imagesDirectory!))

  app.use(async (_req, res, next) => {
    const context: ActionContext = {
      library,
      pubsub,
      updater,
    }

    res.locals.context = context
    next()
  })

  app.get(`/collection-files`, collectionFiles)
  app.post('/update-library', updateLibrary)

  const apollo = new ApolloServer({
    schema,
    subscriptions: { path: '/subscriptions' },
    context: (): GraphqlContext => {
      const requestContext = { library }

      return {
        ...requestContext,
        loaders: createLoaders(requestContext),
        pubsub: pubsub,
      }
    }
  })

  const server = http.createServer(app)
  apollo.applyMiddleware({ app, path: '/graphql' })
  apollo.installSubscriptionHandlers(server)

  return server
}
