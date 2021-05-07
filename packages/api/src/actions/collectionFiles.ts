import fs from 'fs'
import { Request, Response } from 'express'
import isSubdir from 'is-subdir'
import { ActionContext } from '../types'

export const collectionFiles = async (req: Request, res: Response<any, { context: ActionContext }>) => {
  if (req.query.filePath === undefined) return res.sendStatus(400)
  if (typeof req.query.filePath !== 'string') return res.sendStatus(400)

  const collections = await res.locals.context.library.collections()
  const roots = collections.map(collection => collection.path)
  const authorised = roots.some(root => isSubdir(root, req.query.filePath as string))

  if (!authorised) return res.sendStatus(401)

  fs.createReadStream(req.query.filePath).pipe(res)
}
