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
  const t = await harness()

  try {
    const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))

    await t.updater.run()

    const wytchesEntry = (await t.library.entries(t.collection.path))[0]!
    expect(wytchesEntry).toMatchObject({
      fileName: wytches.name,
      filePath: wytches.path,
      corrupt: false,
    })
  } finally {
    await t.cleanup()
  }
})

test('Saves cover images for new files', async () => {
  const t = await harness()

  try {
    await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
    await t.updater.run()

    const wytchesEntry = (await t.library.entries(t.collection.path))[0]!
    const savedImage = await fs.readFile(path.join(t.imageDir.path, wytchesEntry.coverFileName!))
    const actualImage = await fs.readFile(fixturePath('wytches-sample', '0001.jpeg'))
    expect(Buffer.compare(savedImage, actualImage)).toEqual(0)
  } finally {
    await t.cleanup()
  }
})

test('Replaces cover images for changed files', async () => {
  const t = await harness()

  try {
    const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
    await t.updater.run()

    await t.replaceFileInCollectionDirectoryWith(wytches.path, fixturePath('phonogram-sample.cbz'))
    await t.updater.run()

    const entry = (await t.library.entries(t.collection.path))[0]!
    const savedImage = await fs.readFile(path.join(t.imageDir.path, entry.coverFileName!))
    const actualImage = await fs.readFile(fixturePath('phonogram-sample', '0001.jpeg'))
    expect(Buffer.compare(savedImage, actualImage)).toEqual(0)
  } finally {
    await t.cleanup()
  }
})

test('Deletes entries for removed files', async () => {
  const t = await harness()

  try {
    const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
    await t.updater.run()

    expect(await t.library.entries(t.collection.path)).toHaveLength(1)

    await t.deleteFileInCollectionDirectory(wytches.path)
    await t.updater.run()

    expect(await t.library.entries(t.collection.path)).toHaveLength(0)
  } finally {
    await t.cleanup()
  }
})

test('Emits events while processing', async () => {
  const t = await harness()

  try {
    const spy = jest.fn()
    t.updater.on('update', spy)

    const wytches = await t.copyFileToCollectionDirectory(fixturePath('wytches-sample.cbz'))
    await t.updater.run()

    const entriesAfterCreate = await t.library.entries(t.collection.path)
    expect(spy).toHaveBeenCalledWith('create', wytches.path, entriesAfterCreate[0])

    await t.replaceFileInCollectionDirectoryWith(wytches.path, fixturePath('phonogram-sample.cbz'))
    await t.updater.run()

    const entriesAfterChange = await t.library.entries(t.collection.path)
    expect(spy).toHaveBeenCalledWith('change', wytches.path, entriesAfterChange[0])

    await t.deleteFileInCollectionDirectory(wytches.path)
    await t.updater.run()

    expect(spy).toHaveBeenCalledWith('delete', wytches.path)
  } finally {
    await t.cleanup()
  }
})

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
  await config.load()
  teardowns.push(async () => await config.db?.write())

  const collection = await config.createCollection({
    name: 'E2E Test Collection',
    path: collectionDir.path,
  })

  const library = new Library(config)
  const updater = new LibraryUpdater(library, {
    collectionUpdater: new CollectionUpdater({
      getMetadataForFile: async (stat) => {
        return await metadata(stat, [
          new CoverMetadataAdapter({
            imageDirectory: imageDir.path
          })
        ])
      },
      scanDirectory: async (dir, knownFiles) => {
        return await scanDirectory(dir, ['cbr', 'cbz'], knownFiles)
      }
    })
  })

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

  const cleanup = () => Promise.all(teardowns)

  return {
    config,
    library,
    updater,
    collection,
    copyFileToCollectionDirectory,
    replaceFileInCollectionDirectoryWith,
    deleteFileInCollectionDirectory,
    imageDir,
    collectionDir,
    cleanup,
  }
}
