import { Library } from '@comix/library'
import DataLoader from 'dataloader'
import { PubSub } from 'apollo-server-express'
import { LibraryCollection } from './schema'

export interface DataLoaders {
  collections: DataLoader<string, LibraryCollection>
}

export interface RequestContext {
  library: Library
}

export interface DataLoaderContext extends RequestContext {}

export interface GraphqlContext extends RequestContext {
  loaders: DataLoaders
  pubsub: PubSub
}
