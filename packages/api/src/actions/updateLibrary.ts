import { Request, Response } from 'express'
import { CoverMetadataAdapter, Library } from '@comix/library'
import { diff as createDiff, diff, FileDiff, scan } from '@comix/scan-directory'
import { ComicVineMetadataAdapter, ComicVineGateway } from '@comix/comicvine-metadata-adapter'
import { ActionContext } from '../types'

export const updateLibrary = async (_req: Request, res: Response<any, { context: ActionContext }>) => {
  const library = res.locals.context.library

  const comicVineGateway = new ComicVineGateway(
    process.env.COMIC_VINE_HOST!,
    process.env.COMIC_VINE_API_KEY!,
  )

  const imagesDirPath = await library.config.getImagesDirectory()
  if (imagesDirPath === null) {
    return res.status(422).json({ error: 'Library image directory is not set' })
  }

  const diff = await changes(library)
  const adapters = [
    new CoverMetadataAdapter({
      imageDirectory: imagesDirPath
    }),
    new ComicVineMetadataAdapter({
      comicVine: comicVineGateway
    })
  ]

  const updater = res.locals.context.updater
  updater.run(diff, adapters)

  res.json({ started: true })
}

// TODO: expose from @comix/library
const changes = async (library: Library) => {
  const collections = await library.collections()
  const collectionDiffs = await Promise.all(collections.map(async collection => {
    const entries = await library.config.getEntries(collection.path)
    const known = entries
      .filter(entry => entry.issue !== undefined) // TODO: how to expose?
      .map(entry => ({ path: entry.filePath, lastModified: entry.fileLastModified }))

    const state = await scan(collection.path, ['cbr', 'cbz'])

    return createDiff(state, known)
  }))

  return mergeDiffs(...collectionDiffs)
}

// TODO: expose from @comix/library
const mergeDiffs = (...diffs: FileDiff[]): FileDiff => {
  if (diffs.length === 0) return { created: [], changed: [], deleted: [] }
  if (diffs.length === 1) return diffs[0]
  if (diffs.length === 2) return {
    created: [...diffs[0].created, ...diffs[1].created],
    changed: [...diffs[0].changed, ...diffs[1].changed],
    deleted: [...diffs[0].deleted, ...diffs[1].deleted],
  }

  const [first, ...remaining] = diffs

  return mergeDiffs(first, mergeDiffs(...remaining))
}
