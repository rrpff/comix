/**
 * @jest-environment node
 */

import fs from 'fs/promises'
import { runParserTests } from './parserTests'
import { fixturePath } from '../../test/helpers'

const { Parser } = require('../../dist/commonjs')

runParserTests('nodejs - from an ArrayBuffer', async (fpath, name?: string) => {
  const subject = new Parser()
  const file = await fs.readFile(fixturePath(fpath))
  return await subject.parse(file.buffer, name || fpath)
})

runParserTests('nodejs - from a file path', async (fname, name?: string) => {
  const subject = new Parser()
  const fpath = fixturePath(fname)
  return await subject.parse(fpath, name || fname)
})
