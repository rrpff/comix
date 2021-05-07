import fs from 'fs/promises'
import { PassThrough } from 'stream'
import { Request } from 'express'
import { ActionContext } from '../types'
import { InMemoryLibraryConfig, Library } from '@comix/library'
import { generateCollection } from '../../test/generators'
import { collectionFiles } from './collectionFiles'

it('returns 400 if filePath is omitted', async () => {
  const { res, call } = subject()

  await call({ query: {} })

  expect(res.sendStatus).toHaveBeenCalledWith(400)
})

it('returns 400 if filePath is not a string', async () => {
  const { res, call } = subject()

  await call({ query: { filePath: ['whatever'] } })

  expect(res.sendStatus).toHaveBeenCalledWith(400)
})

it('returns 401 if there are no collections', async () => {
  const { res, call } = subject()

  await call({ query: { filePath: 'whatever' } })

  expect(res.sendStatus).toHaveBeenCalledWith(401)
})

it.each([
  '/a/b/c/whatever',
  __filename,
])('returns 401 if trying to read a directory outside of a collection', async (filePath) => {
  const { library, res, call } = subject()

  await library.config.createCollection(generateCollection())

  await call({ query: { filePath } })

  expect(res.sendStatus).toHaveBeenCalledWith(401)
})

it('streams the file if the path is within a collection', async () => {
  const { library, res, call } = subject()

  await library.config.createCollection({ path: __dirname, name: 'whatever' })

  const fileBuf = await fs.readFile(__filename)

  await call({ query: { filePath: __filename } })

  await expectStreamToMatchFile(res, fileBuf)
})

class StubResponse extends PassThrough {
  locals?: { context: ActionContext }
  sendStatus?: (statusCode: number) => void
}

const subject = () => {
  const library = new Library(new InMemoryLibraryConfig())
  const context = { library } as ActionContext

  const res = new StubResponse()
  res.locals = { context }
  res.sendStatus = jest.fn()

  const call = async (req: Partial<Request>) => {
    return await collectionFiles(req as any, res as any)
  }

  return { library, context, res, call }
}

const expectStreamToMatchFile = (stream: PassThrough, expected: Buffer): Promise<void> => {
  return new Promise((resolve, reject) => {
    let data = ''

    stream.on('data', chunk => {
      data += chunk.toString()
    })

    stream.on('error', err => {
      reject(err)
    })

    stream.on('end', () => {
      const actual = Buffer.from(data)
      expect(Buffer.compare(actual, expected)).toEqual(0)
      resolve()
    })
  })
}
