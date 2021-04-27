import { DataLoaders, RequestContext } from '../types'
import { createCollectionsLoader } from './createCollectionsLoader'

export const createLoaders = (context: RequestContext): DataLoaders => {
  return {
    collections: createCollectionsLoader(context)
  }
}
