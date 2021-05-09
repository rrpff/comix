/**
 * @jest-environment jsdom
 */

import fs from 'fs/promises'
import { fixturePath, openW3cFile } from '../../test/helpers'
import { Parser } from '../../dist/commonjs-browser'
import { runParserTests } from './parserTests'

runParserTests('browser - from a File object', async (fpath, name?: string) => {
  const subject = new Parser()
  const file = await openW3cFile(fixturePath(fpath))
  return await subject.parse(file, name || file.name)
})

runParserTests('browser - from an ArrayBuffer', async (fpath, name?: string) => {
  const subject = new Parser()
  const file = await fs.readFile(fixturePath(fpath))
  return await subject.parse(file.buffer, name || fpath)
})

it('throws if passed a string in the browser', async () => {
  const subject = new Parser()
  const fpath = fixturePath('wytches-sample.cbz')
  const call = subject.parse(fpath, 'wytches-sample.cbz')

  await expect(call).rejects
    .toEqual(new Error('Reading files by file name is only supported in Node.js'))
})
