import path from 'path'
import { GraphqlContext } from '../types'
import { QueryResolvers } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['collectionDirectories']

export const collectionDirectories: R = async (_, { input }, { library }) => {
  try {
    await library.config.getCollection(input.path)
    const entries = await library.config.getEntries(input.path)

    return uniq(entries.map(entry => ({
      directory: path.relative(input.path, path.dirname(entry.filePath)).split(path.sep)
    })))
  } catch {
    throw new Error(`Collection "${input.path}" does not exist`)
  }
}

const uniq = <T>(arr: T[]): T[] => arr.reduce((acc, elem) => (
  acc.includes(elem) ? acc : [...acc, elem]
), [] as T[])
