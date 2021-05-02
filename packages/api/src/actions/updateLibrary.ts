import { Request, Response } from 'express'
import { ActionContext } from '../types'

export const updateLibrary = async (_req: Request, res: Response<any, { context: ActionContext }>) => {
  const updater = res.locals.context.updater
  updater.run()

  res.json({ started: true })
}
