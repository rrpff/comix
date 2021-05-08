import { FileStat } from '@comix/scan-directory'
import { LibraryCollection, LibraryConfig, LibraryEntry, MetadataResult } from '../protocols'
import { Library } from '../lib/Library'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { CollectionUpdater } from './CollectionUpdater'
import { diff } from '@comix/scan-directory'

let t: TestHarness
beforeEach(() => {
  t = new TestHarness()
  jest.restoreAllMocks()
})

it('creates an entry in config when there is a new file', async () => {
  const { entry } = t.addCreatedFileToCollectionDirectory()

  await t.runUpdater()

  expect(await t.library.entries(t.collectionPath)).toEqual([entry])
})

it('creates an entry in config for each new file', async () => {
  const { entry: entry1 } = t.addCreatedFileToCollectionDirectory()
  const { entry: entry2 } = t.addCreatedFileToCollectionDirectory()

  await t.runUpdater()

  expect(await t.library.entries(t.collectionPath)).toEqual([entry1, entry2])
})

it('updates existing entries for each changed file', async () => {
  const { original, changed } = await t.changeFileInCollectionDirectory()

  expect(await t.library.entries(t.collectionPath)).toEqual([original])

  await t.runUpdater()

  expect(await t.library.entries(t.collectionPath)).toEqual([changed])
})

it('processes a new file again if it deferred once', async () => {
  const { entry } = t.addCreatedFileToCollectionDirectory()
  t.returnRepeatFromMetadata(entry)

  await t.runUpdater()

  expect(t.metadata).toHaveBeenCalledTimes(2)
  expect(t.metadata).toHaveBeenCalledWith(expect.anything(), false)
  expect(t.metadata).toHaveBeenLastCalledWith(expect.anything(), true)
})

it('processes a changed file again if it deferred once', async () => {
  const { changed } = await t.changeFileInCollectionDirectory()
  t.returnRepeatFromMetadata(changed)

  await t.runUpdater()

  expect(t.metadata).toHaveBeenCalledTimes(2)
  expect(t.metadata).toHaveBeenCalledWith(expect.anything(), false)
  expect(t.metadata).toHaveBeenLastCalledWith(expect.anything(), true)
})

it('continues processing if a new entry errors', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})

  const { entry: entry1 } = t.addCreatedFileToCollectionDirectory()
  const { entry: entry2 } = t.addCreatedFileToCollectionDirectory()

  t.errorInMetadataCallFor(entry1)

  await t.runUpdater()

  expect(t.metadata).toHaveBeenCalledTimes(2)
  expect(t.metadata).toHaveBeenCalledWith(expect.objectContaining({ path: entry1.filePath }), false)
  expect(t.metadata).toHaveBeenCalledWith(expect.objectContaining({ path: entry2.filePath }), false)
})

it('continues processing if a changed entry errors', async () => {
  jest.spyOn(console, 'error').mockImplementation(() => {})

  const { changed: entry1 } = await t.changeFileInCollectionDirectory()
  const { changed: entry2 } = await t.changeFileInCollectionDirectory()

  t.errorInMetadataCallFor(entry1)

  await t.runUpdater()

  expect(t.metadata).toHaveBeenCalledTimes(2)
  expect(t.metadata).toHaveBeenCalledWith(expect.objectContaining({ path: entry1.filePath }), false)
  expect(t.metadata).toHaveBeenCalledWith(expect.objectContaining({ path: entry2.filePath }), false)
})

it('removes deleted files from config', async () => {
  const { entry } = await t.deleteFileInCollectionDirectory()

  expect(await t.library.entries(t.collectionPath)).toEqual([entry])

  await t.runUpdater()

  expect(await t.library.entries(t.collectionPath)).toEqual([])
})

it('emits an update event on creations', async () => {
  const spy = jest.fn()
  t.updater.on('update', spy)

  const { entry } = t.addCreatedFileToCollectionDirectory()
  await t.runUpdater()

  expect(spy).toHaveBeenCalledWith('create', entry.filePath, entry)
})

it('emits an update event on changes', async () => {
  const spy = jest.fn()
  t.updater.on('update', spy)

  const { changed } = await t.changeFileInCollectionDirectory()
  await t.runUpdater()

  expect(spy).toHaveBeenCalledWith('change', changed.filePath, changed)
})

it('emits an update event on deletions', async () => {
  const spy = jest.fn()
  t.updater.on('update', spy)

  const { stat } = await t.deleteFileInCollectionDirectory()
  await t.runUpdater()

  expect(spy).toHaveBeenCalledWith('delete', stat.path)
})

const createRandomEntry = () => {
  const name = `${Math.random()}.cbr`
  return {
    filePath: `/test/${name}`,
    fileName: name,
    fileLastModified: Math.random() * 100,
    fileLastProcessed: Math.random() * 100,
    corrupt: Math.random() > 0.5,
    adaptions: [],
  }
}

class TestHarness {
  public config: LibraryConfig = new InMemoryLibraryConfig()
  public library: Library = new Library(this.config)
  public collection: LibraryCollection = { path: '/test', name: 'Test' }
  public collectionPath: string = '/test'
  public metadata = jest.fn(async (stat) => this.metadatas[stat.path])
  public updater: CollectionUpdater = new CollectionUpdater({
    getMetadataForFile: this.metadata,
    scanDirectory: async (path: string, knownFiles: FileStat[]) => {
      if (path !== this.collectionPath) throw new Error('Scanning the wrong directory')
      return diff(this.filesInCollectionDirectory, knownFiles)
    }
  })

  private finishLoading: Promise<any> = Promise.resolve()
  private metadatas: { [key: string]: MetadataResult } = {}
  private filesInCollectionDirectory: FileStat[] = []

  constructor() {
    this.finishLoading = this.config.createCollection(this.collection)
  }

  public addExistingEntryToLibrary(path: string) {
    const entry = createRandomEntry()

    this.config.setEntry(this.collectionPath, path, entry)
    this.filesInCollectionDirectory.push({ path, lastModified: 0 })
  }

  public addCreatedFileToCollectionDirectory() {
    const entry = createRandomEntry()
    const stat = { path: entry.filePath, lastModified: 0 }

    this.filesInCollectionDirectory.push(stat)
    this.metadatas[entry.filePath] = { entry }

    return { stat, entry }
  }

  public returnRepeatFromMetadata(entry: LibraryEntry) {
    this.metadatas[entry.filePath] = { entry, repeat: true }
  }

  public errorInMetadataCallFor(entry: LibraryEntry) {
    this.metadata = jest.fn(async (stat: FileStat) => {
      if (stat.path === entry.filePath) throw new Error('something bad went wrong')
      return this.metadatas[stat.path]
    })

    this.updater = new CollectionUpdater({
      getMetadataForFile: this.metadata,
      scanDirectory: async (path: string, knownFiles: FileStat[]) => {
        if (path !== this.collectionPath) throw new Error('Scanning the wrong directory')
        return diff(this.filesInCollectionDirectory, knownFiles)
      }
    })
  }

  public async changeFileInCollectionDirectory() {
    const original = createRandomEntry()
    const changed = { ...original, fileLastModified: original.fileLastModified + 100 }
    const stat = { path: original.filePath, lastModified: 0 }

    this.filesInCollectionDirectory.push(stat)
    this.metadatas[original.filePath] = { entry: changed }
    await this.config.setEntry(this.collectionPath, original.filePath, original)

    return { stat, original, changed }
  }

  public async deleteFileInCollectionDirectory() {
    const entry = createRandomEntry()
    const stat = { path: entry.filePath, lastModified: 0 }

    await this.config.setEntry(this.collectionPath, entry.filePath, entry)

    return { entry, stat }
  }

  public async runUpdater() {
    await this.finishLoading
    return await this.updater.update(this.library, this.collection)
  }
}
