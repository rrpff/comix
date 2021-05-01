import fs from 'fs/promises'
import path from 'path'
import isSubdir from 'is-subdir'
import { GraphqlContext } from '../types'
import { QueryResolvers } from '../types/schema'

type R = QueryResolvers<GraphqlContext>['directory']

const unauthorisedError = (path: string) => new Error(`Unauthorised to access: ${path}`)

export const directory: R = async (_, { input }, { library }) => {
  const collections = await library.collections()
  const authorised = collections.some(c => isSubdir(c.path, input.path))

  if (!authorised) throw unauthorisedError(input.path)

  try {
    const contents = await fs.readdir(input.path, { withFileTypes: true })
    const directories = contents.filter(c => c.isDirectory())
    const files = contents.filter(c => c.isFile())

    return {
      path: input.path,
      name: path.basename(input.path),
      directories: directories.map(c => ({
        name: c.name,
        path: path.join(input.path, c.name),
      })),
      files: files.map(c => ({
        name: c.name,
        path: path.join(input.path, c.name),
      })),
    }
  } catch (e) {
    if (e.code === 'ENOENT') throw unauthorisedError(input.path)
    throw e
  }
}
