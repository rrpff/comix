import fs from 'fs/promises'
import { fixturePath } from '../../test/helpers'
import { DEFAULT_JSON_CONFIG, FileLibraryConfig } from './FileLibraryConfig'
import { runLibraryConfigTests } from './runLibraryConfigTests'

let subject: FileLibraryConfig
const file = fixturePath('outputs', 'file-config.json')
beforeEach(async () => subject = await (new FileLibraryConfig(file)).load())
afterEach(async () => {
  try {
    await subject.db!.write()
    await fs.rm(file)
  } catch {}
})

const configFileState = async () => {
  await subject.db?.write()
  return JSON.parse((await fs.readFile(file)).toString())
}

runLibraryConfigTests(() => subject)

it.each([
  ['/fake/directory'],
  ['/another/fake/directory'],
])('retrieves config from the given config file', async (imagesDirectoryPath) => {
  await fs.writeFile(file, JSON.stringify({ imagesDirectoryPath }))
  const subject = await new FileLibraryConfig(file).load()
  expect(await subject.getImagesDirectory()).toEqual(imagesDirectoryPath)
})

it('creates the given config file if it does not exist', async () => {
  expect(await configFileState()).toEqual(DEFAULT_JSON_CONFIG)
})

it('writes changes to the config file', async () => {
  await subject.setImagesDirectory('/best/dir')
  expect(await configFileState()).toMatchObject({ imagesDirectoryPath: '/best/dir' })
})
