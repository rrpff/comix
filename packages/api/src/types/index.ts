import { Library } from '@comix/library'

export interface DataLoaders {}

export interface RequestContext {
  library: Library
}

export interface DataLoaderContext extends RequestContext {}

export interface GraphqlContext extends RequestContext {
  loaders: DataLoaders
}
