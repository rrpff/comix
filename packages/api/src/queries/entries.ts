import path from 'path'
import { LibraryEntry as ComixEntry } from '@comix/library'
import { GraphqlContext } from '../types'
import { QueryResolvers, LibraryEntry as ApiEntry } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['entries']

export const entries: R = async (_, { input }, { library }) => {
  const entries = await library.config.getEntries(input.collection)

  return input.directoryPath
    ? entries.filter(withinDirectory(input.directoryPath)).map(mapResult)
    : entries.map(mapResult)
}

const withinDirectory = (directoryPath: string) => {
  return (entry: ComixEntry) => {
    return path.dirname(entry.filePath) === directoryPath
  }
}

const mapResult = (entry: ComixEntry): ApiEntry => ({
  fileName: entry.fileName,
  filePath: entry.filePath,
  fileLastModified: entry.fileLastModified,
  fileLastProcessed: entry.fileLastProcessed,
  corrupt: entry.corrupt,
  coverFileName: entry.coverFileName,
  volumeName: entry.volumeName,
  volumeYear: entry.volumeYear,
})
