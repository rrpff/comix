export * from './generated'

export interface DataLoaders {}

export interface RequestContext {}

export interface DataLoaderContext extends RequestContext {}

export interface GraphqlContext extends RequestContext {
  loaders: DataLoaders
}
