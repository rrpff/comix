import DataLoader from 'dataloader'
import { RequestContext } from '../types'

export const createCollectionsLoader = (context: RequestContext) => {
  return new DataLoader(async (paths: readonly string[]) => {
    return await Promise.all(paths.map(path =>
      context.library.config.getCollection(path)
    ))
  })
}
