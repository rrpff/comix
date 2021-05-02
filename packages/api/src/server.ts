import http from 'http'
import { ApolloServer, PubSub } from 'apollo-server-express'
import express from 'express'
import cors from 'cors'
import { CollectionUpdater, CoverMetadataAdapter, Library, LibraryUpdater, metadata } from '@comix/library'
import { scanDirectory } from '@comix/scan-directory'
import schema from './schema'
import { ActionContext, GraphqlContext } from './types'
import { createLoaders } from './loaders'
import { updateLibrary } from './actions/updateLibrary'

interface ServerOptions {
  library: Library
}

export default async ({ library }: ServerOptions) => {
  const imagesDirPath = await library.config.getImagesDirectory()
  if (imagesDirPath === null) throw new Error('Missing images directory')

  const updater = new LibraryUpdater(library, {
    collectionUpdater: new CollectionUpdater({
      getMetadataForFile: async (stat) => {
        return await metadata(stat, [
          new CoverMetadataAdapter({
            imageDirectory: imagesDirPath
          }),
        ])
      },
      scanDirectory: async (dir, knownFiles) => {
        return await scanDirectory(dir, ['cbr', 'cbz'], knownFiles)
      }
    })
  })

  const app = express()
  const pubsub = new PubSub()

  app.use(cors())

  const imagesDirectory = await library.config.getImagesDirectory()
  app.use('/assets/images', express.static(imagesDirectory!))

  const collections = await library.collections()
  collections.forEach(collection =>
    app.use(`/collections${collection.path}`, express.static(collection.path))
  )

  app.use(async (_req, res, next) => {
    const context: ActionContext = {
      library,
      pubsub,
      updater,
    }

    res.locals.context = context
    next()
  })

  app.post('/update-library', updateLibrary)

  const apollo = new ApolloServer({
    schema,
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
