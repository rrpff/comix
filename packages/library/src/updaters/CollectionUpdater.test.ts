import { FileStat, FileDiff } from '@comix/scan-directory'
import { LibraryCollection, LibraryConfig, LibraryEntry } from '../protocols'
import { Library } from '../lib/Library'
import { InMemoryLibraryConfig } from '../config/InMemoryLibraryConfig'
import { CollectionUpdater } from './CollectionUpdater'

let t: TestHarness
beforeEach(() => {
  t = new TestHarness()
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
  const { original, changed } = t.changeFileInCollectionDirectory()

  expect(await t.library.entries(t.collectionPath)).toEqual([original])

  await t.runUpdater()

  expect(await t.library.entries(t.collectionPath)).toEqual([changed])
})

it('removes deleted files from config', async () => {
  const { entry } = t.deleteFileInCollectionDirectory()

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

  const { changed } = t.changeFileInCollectionDirectory()
  await t.runUpdater()

  expect(spy).toHaveBeenCalledWith('change', changed.filePath, changed)
})

it('emits an update event on deletions', async () => {
  const spy = jest.fn()
  t.updater.on('update', spy)

  const { stat } = t.deleteFileInCollectionDirectory()
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
  public updater: CollectionUpdater = new CollectionUpdater({
    getMetadataForFile: async (stat) => this.metadatas[stat.path],
    diffFiles: () => this.diff,
    scanDirectory: (path: string) => {
      if (path !== this.collectionPath) throw new Error('Scanning the wrong directory')
      return this.knownFiles
    }
  })

  private finishLoading: Promise<any> = Promise.resolve()
  private metadatas: { [key: string]: LibraryEntry } = {}
  private knownFiles: FileStat[] = []
  private diff: FileDiff = {
    created: [],
    changed: [],
    deleted: [],
  }

  constructor() {
    this.finishLoading = this.config.createCollection(this.collection)
  }

  public addExistingEntryToLibrary(path: string) {
    const entry = createRandomEntry()

    this.config.setEntry(this.collectionPath, path, entry)
    this.knownFiles.push({ path, lastModified: 0 })
  }

  public addCreatedFileToCollectionDirectory() {
    const entry = createRandomEntry()
    const stat = { path: entry.filePath, lastModified: 0 }

    this.diff.created.push(stat)
    this.knownFiles.push(stat)
    this.metadatas[entry.filePath] = entry

    return { stat, entry }
  }

  public changeFileInCollectionDirectory() {
    const original = createRandomEntry()
    const changed = { ...original, fileLastModified: original.fileLastModified + 100 }
    const stat = { path: original.filePath, lastModified: 0 }

    this.diff.changed.push(stat)
    this.knownFiles.push(stat)
    this.metadatas[original.filePath] = changed
    this.config.setEntry(this.collectionPath, original.filePath, original)

    return { stat, original, changed }
  }

  public deleteFileInCollectionDirectory() {
    const entry = createRandomEntry()
    const stat = { path: entry.filePath, lastModified: 0 }

    this.diff.deleted.push(stat)
    this.config.setEntry(this.collectionPath, entry.filePath, entry)

    return { entry, stat }
  }

  public async runUpdater() {
    await this.finishLoading
    return await this.updater.update(this.library, this.collection)
  }
}
