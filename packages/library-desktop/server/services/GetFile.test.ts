import path from 'path'
import fs from 'fs'
import { GetFile } from './GetFile'

it.each([
  [path.join('/', 'all-my-passwords.txt'), '/'],
  [path.join('/Users/richard', 'your-birthday-presents.txt'), '/Users/richard'],
])('returns an error if the file is outside of a user configured folder', async (fpath, dirname) => {
  const result = await GetFile(fpath)

  expect(result.error).toEqual(`Not authorised to read from "${dirname}"`)
})

it.each([
  [path.join(__dirname, 'do-not-make-this-file.txt'), 'do-not-make-this-file.txt'],
  [path.join(__dirname, '..', 'or-this-one.txt'), 'or-this-one.txt'],
])('returns an error if the file does not exist', async (fpath, fname) => {
  const result = await GetFile(fpath)

  expect(result.error).toEqual(`File "${fname}" does not exist`)
})

it.each([
  [path.join(__dirname, 'GetFile.test.ts'), 'GetFile.test.ts'],
  [path.join(__dirname, 'GetFile.ts'), 'GetFile.ts'],
])('returns file metadata if the file exists', async (fpath, fname) => {
  const result = await GetFile(fpath)

  expect(result.success).toMatchObject({
    name: fname,
    path: fpath,
    type: ''
  })
})

it.each([
  path.join(__dirname, 'GetFile.test.ts'),
  path.join(__dirname, 'GetFile.ts'),
])('returns file contents if the file exists', async (fpath) => {
  const result = await GetFile(fpath)
  const expectedBuffer = await fs.promises.readFile(fpath)
  const actualBuffer = Buffer.from(result.success.content)

  expect(Buffer.compare(actualBuffer, expectedBuffer)).toEqual(0)
})
