import { LibraryConfig, LibraryEntry } from '../protocols'
import { fixturePath } from '../../test/helpers'

export const runLibraryConfigTests = (createSubject: () => LibraryConfig) => {
  let subject: LibraryConfig
  beforeEach(() => subject = createSubject())

  it('returns null when the images directory is not set', async () => {
    expect(await subject.getImagesDirectory()).toEqual(null)
  })

  it.each([
    '/cool-directory',
    '/great/dir',
  ])('supports changing the images directory', async (directory) => {
    await subject.setImagesDirectory(directory)
    expect(await subject.getImagesDirectory()).toEqual(directory)
  })

  it.each([
    { name: 'a', path: '/collection-a' },
    { name: 'a', path: '/collection-b' },
  ])('supports creating new collections', async (collection) => {
    await subject.createCollection(collection)
    expect(await subject.getCollections()).toContainEqual(collection)
  })

  it('supports reading multiple collections', async () => {
    await subject.createCollection({ name: 'x', path: '/collection-x' })
    await subject.createCollection({ name: 'y', path: '/collection-y' })

    expect(await subject.getCollections()).toEqual(
      expect.arrayContaining([
        { name: 'x', path: '/collection-x' },
        { name: 'y', path: '/collection-y' },
      ])
    )
  })

  it.each([
    createEntry({ filePath: fixturePath('wytches-sample.cbz') }),
    createEntry({ filePath: fixturePath('phonogram-sample.cbr') }),
  ])('supports storing entries', async (entry) => {
    await subject.createCollection({ name: 'a', path: '/collection-a' })
    await subject.setEntry('/collection-a', entry.filePath, entry)

    expect(await subject.getEntry('/collection-a', entry.filePath)).toEqual(entry)
  })

  it.each([
    createEntry({ filePath: fixturePath('wytches-sample.cbz') }),
    createEntry({ filePath: fixturePath('phonogram-sample.cbr') }),
  ])('supports storing entries', async (entry) => {
    await subject.createCollection({ name: 'a', path: '/collection-a' })
    await subject.setEntry('/collection-a', entry.filePath, entry)

    expect(await subject.getEntry('/collection-a', entry.filePath)).toEqual(entry)
  })

  it.each([
    ['/collection-a', '/entry-a'],
    ['/collection-b', '/entry-b'],
  ])('throws an error when reading an entry that does not exist', async (collection, entry) => {
    const call = subject.getEntry(collection, entry)

    await expect(call).rejects
      .toEqual(new Error(`Entry "${entry}" in "${collection}" does not exist`))
  })

  it('can delete collections', async () => {
    await subject.createCollection({ path: 'whatever', name: 'cool' })
    await subject.deleteCollection('whatever')

    expect(await subject.getCollections()).toEqual([])
  })

  it('deletes collection entries when deleting a collection', async () => {
    await subject.createCollection({ path: 'home-comics', name: 'home' })
    await subject.setEntry('home-comics', 'entry-a', createEntry())
    await subject.deleteCollection('home-comics')

    await expect(subject.getEntry('home-comics', 'entry-a')).rejects
      .toEqual(new Error(`Entry "entry-a" in "home-comics" does not exist`))
  })

  it('only deletes entries for the deleted collection', async () => {
    const appleEntry = createEntry()
    const grapeEntry = createEntry()

    await subject.createCollection({ path: '/apples', name: 'apples' })
    await subject.createCollection({ path: '/grapes', name: 'grapes' })

    await subject.setEntry('/apples', appleEntry.filePath, appleEntry)
    await subject.setEntry('/grapes', grapeEntry.filePath, grapeEntry)
    await subject.deleteCollection('/apples')

    expect(await subject.getEntry('/grapes', grapeEntry.filePath)).toEqual(grapeEntry)
  })

  it('does nothing when deleting an collection that does not exist', async () => {
    await subject.deleteCollection('i-was-never-here')
  })

  it('can delete entries', async () => {
    await subject.createCollection({ path: 'home-comics', name: 'home' })
    await subject.setEntry('home-comics', 'entry-a', createEntry())
    await subject.deleteEntry('home-comics', 'entry-a')

    await expect(subject.getEntry('home-comics', 'entry-a')).rejects
      .toEqual(new Error(`Entry "entry-a" in "home-comics" does not exist`))
  })

  it('does nothing when deleting an entry that does not exist', async () => {
    await subject.createCollection({ path: 'real-collection', name: 'home' })
    await subject.deleteEntry('real-collection', 'fake-entry')
  })

  it('throws an error when creating an entry in a collection that does not exist', async () => {
    const call = subject.setEntry('real-collection', 'fake-entry', createEntry())

    await expect(call).rejects.toEqual(new Error('Collection "real-collection" does not exist'))
  })

  it('throws an error when reading a collection that does not exist', async () => {
    const call = subject.getCollection('fake-collection')

    await expect(call).rejects.toEqual(new Error('Collection "fake-collection" does not exist'))
  })

  it.each([
    { path: 'superman-collection', name: 'supes' },
    { path: 'batman-collection', name: 'bats' },
  ])('can read a collection', async (collection) => {
    await subject.createCollection(collection)

    expect(await subject.getCollection(collection.path)).toEqual(collection)
  })

  it('can get all entries in a collection', async () => {
    const entries = [createEntry(), createEntry()]

    await subject.createCollection({ path: '/wonder-woman', name: 'wonder woman' })
    await subject.setEntry('/wonder-woman', entries[0].filePath, entries[0])
    await subject.setEntry('/wonder-woman', entries[1].filePath, entries[1])

    expect(await subject.getEntries('/wonder-woman')).toEqual(entries)
  })

  it('only returns entries in that collection', async () => {
    const entries = [createEntry(), createEntry()]

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.createCollection({ path: '/black-hole', name: 'black hole' })
    await subject.setEntry('/rachel-rising', entries[0].filePath, entries[0])
    await subject.setEntry('/black-hole', entries[1].filePath, entries[1])

    expect(await subject.getEntries('/rachel-rising')).toEqual([entries[0]])
  })

  it('updates entries when setting them again', async () => {
    const original = createEntry()
    const updated = { ...original, fileName: 'changed!!!!' }

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', original.filePath, original)
    await subject.setEntry('/rachel-rising', original.filePath, updated)

    expect(await subject.getEntry('/rachel-rising', original.filePath)).toEqual(updated)
  })

  it('can update collections', async () => {
    const original = { path: `/cool-collection-${Math.random()}`, name: `Cool Comics ${Math.random()}` }
    const changed = { path: `/great-collection-${Math.random()}`, name: `Great Comics ${Math.random()}` }

    await subject.createCollection(original)
    await subject.updateCollection(original.path, changed)

    expect(await subject.getCollection(changed.path)).toEqual(changed)
    await expect(subject.getCollection(original.path)).rejects
      .toEqual(new Error(`Collection "${original.path}" does not exist`))
  })

  it('repaths entries when moving a collection', async () => {
    const originalCollection = { path: '/comics', name: 'Comics' }
    const updatedCollection = { path: '/media/comics', name: 'Comics' }
    const originalEntry = createEntry({ filePath: '/comics/file.cbr' })
    const updatedEntry = { ...originalEntry, filePath: '/media/comics/file.cbr' }

    await subject.createCollection(originalCollection)
    await subject.setEntry('/comics', originalEntry.filePath, originalEntry)
    await subject.updateCollection('/comics', updatedCollection)

    expect(await subject.getEntries('/media/comics'))
      .toContainEqual(updatedEntry)

    expect(await subject.getEntry('/media/comics', '/media/comics/file.cbr'))
      .toEqual(updatedEntry)

    await expect(subject.getEntry('/comics', '/comics/file.cbr')).rejects
      .toEqual(new Error('Entry "/comics/file.cbr" in "/comics" does not exist'))

    await expect(subject.getEntry('/media/comics', '/comics/file.cbr')).rejects
      .toEqual(new Error('Entry "/comics/file.cbr" in "/media/comics" does not exist'))
  })
}

export function createEntry(overrides: Partial<LibraryEntry> = {}): LibraryEntry {
  const filename = `example-comic-${Math.random()}.cbz`

  return {
    fileName: filename,
    filePath: fixturePath(filename),
    fileLastModified: 123,
    fileLastProcessed: 456,
    corrupt: false,
    coverFileName: undefined,
    adaptions: [],
    ...overrides
  }
}
