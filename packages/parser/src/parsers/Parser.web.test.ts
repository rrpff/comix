/**
 * @jest-environment jsdom
 */

import fs from 'fs/promises'
import { fixturePath, openW3cFile } from '../../test/helpers'
import { Parser } from './Parser'
import { runParserTests } from './parserTests'

runParserTests(async (fpath, name?: string) => {
  const subject = new Parser()
  const file = await openW3cFile(fixturePath(fpath))
  return await subject.parse(file, name || file.name)
})

runParserTests(async (fpath, name?: string) => {
  const subject = new Parser()
  const file = await fs.readFile(fixturePath(fpath))
  return await subject.parse(file.buffer, name || fpath)
})
