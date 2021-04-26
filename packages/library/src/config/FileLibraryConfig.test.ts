import fs from 'fs/promises'
import { fixturePath } from '../../test/helpers'
import { DEFAULT_JSON_CONFIG, FileLibraryConfig } from './FileLibraryConfig'
import { runLibraryConfigTests } from './runLibraryConfigTests'

const filePath = fixturePath('outputs', 'file-config.json')
let subject: FileLibraryConfig
beforeEach(async () => subject = new FileLibraryConfig(filePath))
afterEach(async () => {
  try {
    await fs.rm(filePath)
  } catch {}
})
runLibraryConfigTests(() => subject)

it('retrieves config from the given config file', async () => {
  const fileClonePath = fixturePath('outputs', 'file-config-clone.json')

  try {
    const imagesDirectoryPath = Math.random().toString()
    await subject.setImagesDirectory(imagesDirectoryPath)

    await fs.copyFile(filePath, fileClonePath)

    const clone = new FileLibraryConfig(fileClonePath)
    expect(await clone.getImagesDirectory()).toEqual(imagesDirectoryPath)
  } finally {
    fs.rm(fixturePath('outputs', 'file-config-clone.json'))
  }
})
