import fs from 'fs/promises'
import path from 'path'
import tmp from 'tmp-promise'
import { scanDirectory } from '@comix/scan-directory'
import { FileLibraryConfig } from '../../src/config/FileLibraryConfig'
import { Library } from '../../src/lib/Library'
import { metadata } from '../../src/lib/metadata'
import { CollectionUpdater } from '../../src/updaters/CollectionUpdater'
import { LibraryUpdater } from '../../src/updaters/LibraryUpdater'
import { CoverMetadataAdapter } from '../../src/adapters/CoverMetadataAdapter'
import { fixturePath } from '../helpers'

test('Creates entries for new files', async () => {
  const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))

  await t.runUpdater()

  const wytchesEntry = (await t.library.entries(t.collection.path))[0]!
  expect(wytchesEntry).toMatchObject({
    fileName: wytches.name,
    filePath: wytches.path,
    corrupt: false,
  })
})

test('Saves cover images for new files', async () => {
  await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
  await t.runUpdater()

  const wytchesEntry = (await t.library.entries(t.collection.path))[0]!
  const savedImage = await fs.readFile(path.join(t.imageDir.path, 'small', wytchesEntry.coverFileName!))
  const actualImage = await fs.readFile(fixturePath('wytches-sample-small-0001.jpeg'))
  expect(Buffer.compare(savedImage, actualImage)).toEqual(0)
})

test('Replaces cover images for changed files', async () => {
  const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
  await t.runUpdater()

  await t.replaceFileInCollectionDirectoryWith(wytches.path, fixturePath('phonogram-sample.cbz'))
  await t.runUpdater()

  const entry = (await t.library.entries(t.collection.path))[0]!
  const savedImage = await fs.readFile(path.join(t.imageDir.path, 'small', entry.coverFileName!))
  const actualImage = await fs.readFile(fixturePath('phonogram-sample-small-0001.jpeg'))
  expect(Buffer.compare(savedImage, actualImage)).toEqual(0)
})

test('Deletes entries for removed files', async () => {
  const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
  await t.runUpdater()

  expect(await t.library.entries(t.collection.path)).toHaveLength(1)

  await t.deleteFileInCollectionDirectory(wytches.path)
  await t.runUpdater()

  expect(await t.library.entries(t.collection.path)).toHaveLength(0)
})

test('Emits events while processing', async () => {
  const spy = jest.fn()
  t.updater.on('update', spy)

  const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
  await t.runUpdater()

  const entriesAfterCreate = await t.library.entries(t.collection.path)
  expect(spy).toHaveBeenCalledWith('create', wytches.path, entriesAfterCreate[0])

  await t.replaceFileInCollectionDirectoryWith(wytches.path, fixturePath('phonogram-sample.cbz'))
  await t.runUpdater()

  const entriesAfterChange = await t.library.entries(t.collection.path)
  expect(spy).toHaveBeenCalledWith('change', wytches.path, entriesAfterChange[0])

  await t.deleteFileInCollectionDirectory(wytches.path)
  await t.runUpdater()

  expect(spy).toHaveBeenCalledWith('delete', wytches.path)
})

type PromiseType<T extends Promise<any>> = T extends Promise<infer R> ? R : never;

let t: PromiseType<ReturnType<typeof harness>>
beforeEach(async () => t = await harness())
afterEach(async () => t.cleanup())

const harness = async () => {
  const configFile = await tmp.file()
  const imageDir = await tmp.dir()
  const collectionDir = await tmp.dir()

  const teardowns = [
    configFile.cleanup,
    imageDir.cleanup,
    collectionDir.cleanup
  ]

  const config = new FileLibraryConfig(configFile.path)
  const collection = await config.createCollection({
    name: 'E2E Test Collection',
    path: collectionDir.path,
  })

  const library = new Library(config)
  const updater = new LibraryUpdater(library)

  const copyFileToCollectionDirectory = async (localPath: string) => {
    const ext = path.extname(localPath)
    const destFile = await tmp.file({ template: path.join(collectionDir.path, `XXXXXX${ext}`) })

    teardowns.push(destFile.cleanup)

    await fs.copyFile(localPath, destFile.path)

    return {
      name: path.basename(destFile.path),
      path: destFile.path,
    }
  }

  const replaceFileInCollectionDirectoryWith = async (remotePath: string, localPath: string) => {
    await fs.copyFile(localPath, remotePath)

    return {
      name: path.basename(remotePath),
      path: remotePath,
    }
  }

  const deleteFileInCollectionDirectory = async (remotePath: string) => {
    await fs.rm(remotePath)
  }

  const runUpdater = async () => {
    const knownFiles = (await library.config.getEntries(collectionDir.path))
      .map(entry => ({ path: entry.filePath, lastModified: entry.fileLastModified }))

    const diff = await scanDirectory(collectionDir.path, ['cbr', 'cbz'], knownFiles)
    const adapters = [
      new CoverMetadataAdapter({
        imageDirectory: imageDir.path
      })
    ]

    return await updater.run(diff, adapters)
  }

  const cleanup = () => Promise.all(teardowns)

  return {
    config,
    library,
    updater,
    collection,
    copyFileToCollectionDirectory,
    replaceFileInCollectionDirectoryWith,
    deleteFileInCollectionDirectory,
    runUpdater,
    imageDir,
    collectionDir,
    cleanup,
  }
}
