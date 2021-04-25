/**
 * @jest-environment node
 */

import fs from 'fs/promises'
import { Parser } from './Parser'
import { runParserTests } from './parserTests'
import { fixturePath } from '../../test/helpers'

runParserTests(async (fpath, name?: string) => {
  const subject = new Parser()
  const file = await fs.readFile(fixturePath(fpath))
  return await subject.parse(file.buffer, name || fpath)
})
