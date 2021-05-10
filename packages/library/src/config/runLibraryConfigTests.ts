import faker from 'faker'
import { LibraryConfig, LibraryEntry, LibraryIssue } from '../protocols'
import { fixturePath } from '../../test/helpers'
import { generateCredit, generateEntry, generateIssue, generatePersonCredit, generateVolume, list } from '../../test/generators'

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

  it('throws an error creating new collections', async () => {
    const collection = { name: 'a', path: '/collection-a' }

    await subject.createCollection(collection)
    const call = subject.createCollection(collection)

    await expect(call).rejects
      .toEqual(new Error(`Collection "${collection.path}" already exists`))
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
    generateEntry({ filePath: fixturePath('wytches-sample.cbz') }),
    generateEntry({ filePath: fixturePath('phonogram-sample.cbr') }),
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
    await subject.setEntry('home-comics', 'entry-a', generateEntry())
    await subject.deleteCollection('home-comics')

    await expect(subject.getEntry('home-comics', 'entry-a')).rejects
      .toEqual(new Error(`Entry "entry-a" in "home-comics" does not exist`))
  })

  it('only deletes entries for the deleted collection', async () => {
    const appleEntry = generateEntry()
    const grapeEntry = generateEntry()

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
    await subject.setEntry('home-comics', 'entry-a', generateEntry())
    await subject.deleteEntry('home-comics', 'entry-a')

    await expect(subject.getEntry('home-comics', 'entry-a')).rejects
      .toEqual(new Error(`Entry "entry-a" in "home-comics" does not exist`))
  })

  it('does nothing when deleting an entry that does not exist', async () => {
    await subject.createCollection({ path: 'real-collection', name: 'home' })
    await subject.deleteEntry('real-collection', 'fake-entry')
  })

  it('throws an error when creating an entry in a collection that does not exist', async () => {
    const call = subject.setEntry('real-collection', 'fake-entry', generateEntry())

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
    const entries = [generateEntry(), generateEntry()]

    await subject.createCollection({ path: '/wonder-woman', name: 'wonder woman' })
    await subject.setEntry('/wonder-woman', entries[0].filePath, entries[0])
    await subject.setEntry('/wonder-woman', entries[1].filePath, entries[1])

    expect((await subject.getEntries('/wonder-woman')).sort(sortByFileName))
      .toEqual(entries.sort(sortByFileName))
  })

  it('can get all entries in a collection with issues', async () => {
    const entries = [
      generateEntry({ issue: generateIssue() }),
      generateEntry({ issue: generateIssue() })
    ]

    await subject.createCollection({ path: '/wonder-woman', name: 'wonder woman' })
    await subject.setEntry('/wonder-woman', entries[0].filePath, entries[0])
    await subject.setEntry('/wonder-woman', entries[1].filePath, entries[1])

    expect((await subject.getEntries('/wonder-woman')).sort(sortByFileName))
      .toMatchObject(entries.sort(sortByFileName))
  })

  it('can get an entry in a collection with its issue', async () => {
    const entry = generateEntry({ issue: generateIssue() })

    await subject.createCollection({ path: '/wonder-woman', name: 'wonder woman' })
    await subject.setEntry('/wonder-woman', entry.filePath, entry)

    expect(await subject.getEntry('/wonder-woman', entry.filePath)).toMatchObject(entry)
  })

  it('only returns entries in that collection', async () => {
    const entries = [generateEntry(), generateEntry()]

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.createCollection({ path: '/black-hole', name: 'black hole' })
    await subject.setEntry('/rachel-rising', entries[0].filePath, entries[0])
    await subject.setEntry('/black-hole', entries[1].filePath, entries[1])

    expect(await subject.getEntries('/rachel-rising')).toEqual([entries[0]])
  })

  it('updates entries when setting them again', async () => {
    const original = generateEntry()
    const updated = { ...original, fileName: 'changed!!!!' }

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', original.filePath, original)
    await subject.setEntry('/rachel-rising', original.filePath, updated)

    expect(await subject.getEntry('/rachel-rising', original.filePath)).toEqual(updated)
  })

  it('creates an issue when creating an entry with a new issue', async () => {
    const issue = generateIssue()
    const entry = generateEntry({ issue })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entry.filePath, entry)

    const retrievedIssue = await subject.getIssue({ source: issue.source, sourceId: issue.sourceId })
    expect(retrievedIssue).toMatchObject(issue)
    expect(retrievedIssue.entries).toContainEqual({ collectionPath: '/rachel-rising', entry: { ...entry, issue: undefined } })
  })

  it('updates an issue when creating an entry with an existing issue', async () => {
    const issue = generateIssue()
    const other = generateEntry({ filePath: 'other.cbz', issue })
    const original = generateEntry({ filePath: 'original.cbz', issue })
    const updated = generateEntry({ filePath: 'updated.cbz', issue })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', other.filePath, other)
    await subject.setEntry('/rachel-rising', original.filePath, original)
    await subject.setEntry('/rachel-rising', original.filePath, updated)

    const retrievedIssue = await subject.getIssue({ source: issue.source, sourceId: issue.sourceId })
    expect(retrievedIssue).toMatchObject(issue)
    expect(retrievedIssue.entries).toHaveLength(2)
    expect(retrievedIssue.entries).toContainEqual({ collectionPath: '/rachel-rising', entry: { ...other, issue: undefined } })
    expect(retrievedIssue.entries).toContainEqual({ collectionPath: '/rachel-rising', entry: { ...updated, issue: undefined } })
  })

  it.each([
    { creditKey: 'characters', generate: () => list(() => generateCredit({ type: 'character' })) },
    { creditKey: 'concepts', generate: () => list(() => generateCredit({ type: 'concept' })) },
    { creditKey: 'locations', generate: () => list(() => generateCredit({ type: 'location' })) },
    { creditKey: 'objects', generate: () => list(() => generateCredit({ type: 'object' })) },
    { creditKey: 'people', generate: () => list(() => generatePersonCredit()) },
    { creditKey: 'storyArcs', generate: () => list(() => generateCredit({ type: 'storyArc' })) },
    { creditKey: 'teams', generate: () => list(() => generateCredit({ type: 'team' })) },
  ])('creates credits when creating entries with issues', async ({ creditKey, generate }) => {
    const credits = generate()
    const issue = generateIssue({ [creditKey]: credits })
    const entry = generateEntry({ issue })

    await subject.createCollection({ path: '/cool', name: 'cool comix' })
    await subject.setEntry('/cool', entry.filePath, entry)

    expect.assertions(1 + credits.length)

    const retrievedIssue = await subject.getIssue({ source: issue.source, sourceId: issue.sourceId })
    expect(retrievedIssue[creditKey as keyof LibraryIssue]).toEqual(expect.arrayContaining(credits))

    await Promise.all(credits.map(async credit => {
      const retrievedCredit = await subject.getCredit({ source: credit.source, sourceId: credit.sourceId })
      expect(retrievedCredit).toMatchObject({
        ...credit,
        issues: [{
          ...issue,
          characters: undefined,
          concepts: undefined,
          locations: undefined,
          objects: undefined,
          people: undefined,
          storyArcs: undefined,
          teams: undefined,
        }]
      })
    }))
  })

  it.each([
    { creditKey: 'characters', generate: () => list(() => generateCredit({ type: 'character' })) },
    { creditKey: 'concepts', generate: () => list(() => generateCredit({ type: 'concept' })) },
    { creditKey: 'locations', generate: () => list(() => generateCredit({ type: 'location' })) },
    { creditKey: 'objects', generate: () => list(() => generateCredit({ type: 'object' })) },
    { creditKey: 'people', generate: () => list(() => generatePersonCredit()) },
    { creditKey: 'storyArcs', generate: () => list(() => generateCredit({ type: 'storyArc' })) },
    { creditKey: 'teams', generate: () => list(() => generateCredit({ type: 'team' })) },
  ])('updates credits when creating entries with issues with the same credits', async ({ creditKey, generate }) => {
    const credits = generate()
    const issueOne = generateIssue({ [creditKey]: credits })
    const issueTwo = generateIssue({ [creditKey]: credits })
    const entryOne = generateEntry({ issue: issueOne })
    const entryTwo = generateEntry({ issue: issueTwo })

    await subject.createCollection({ path: '/cool', name: 'cool comix' })
    await subject.setEntry('/cool', entryOne.filePath, entryOne)
    await subject.setEntry('/cool', entryTwo.filePath, entryTwo)

    expect.assertions(1 + credits.length * 3)

    const retrievedIssueOne = await subject.getIssue({ source: issueOne.source, sourceId: issueOne.sourceId })
    expect(retrievedIssueOne[creditKey as keyof LibraryIssue]).toEqual(expect.arrayContaining(credits))

    await Promise.all(credits.map(async credit => {
      const retrievedCredit = await subject.getCredit({ source: credit.source, sourceId: credit.sourceId })
      const retrievedCreditIssues = retrievedCredit.issues?.map(issue => issue.sourceId)

      expect(retrievedCreditIssues).toHaveLength(2)
      expect(retrievedCreditIssues).toContain(issueOne.sourceId)
      expect(retrievedCreditIssues).toContain(issueTwo.sourceId)
    }))
  })

  it('removing an entry removes associated issues', async () => {
    const issue = generateIssue()
    const entry = generateEntry({ issue })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entry.filePath, entry)
    await subject.deleteEntry('/rachel-rising', entry.filePath)

    const call = subject.getIssue({ source: issue.source, sourceId: issue.sourceId })

    await expect(call).rejects.toEqual(new Error(`Issue "${issue.source}:${issue.sourceId}" does not exist`))
  })

  it('removing an entry removes associated issues unless another entry references them', async () => {
    const volume = generateVolume({ sourceId: 'test volume' }) // TODO: remove me
    const issue = generateIssue({ volume })
    const entryOne = generateEntry({ filePath: 'first.cbz', issue })
    const entryTwo = generateEntry({ filePath: 'second.cbz', issue })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entryOne.filePath, entryOne)
    await subject.setEntry('/rachel-rising', entryTwo.filePath, entryTwo)
    await subject.deleteEntry('/rachel-rising', entryOne.filePath)

    const retrieved = await subject.getIssue({ source: issue.source, sourceId: issue.sourceId })

    expect(retrieved).toMatchObject(issue)
    expect(retrieved.entries).toHaveLength(1)
  })

  it('removing an issue removes associated credits', async () => {
    const credit = generatePersonCredit()
    const issue = generateIssue({ people: [credit] })
    const entry = generateEntry({ filePath: 'first.cbz', issue: issue })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entry.filePath, entry)
    await subject.deleteEntry('/rachel-rising', entry.filePath)

    const call = subject.getCredit({ source: credit.source, sourceId: credit.sourceId })

    await expect(call).rejects.toEqual(new Error(`Credit "${credit.source}:${credit.sourceId}" does not exist`))
  })

  it('removing an issue removes associated credits unless another issue references them', async () => {
    const credit = generatePersonCredit()
    const issueOne = generateIssue({ people: [credit] })
    const issueTwo = generateIssue({ people: [credit] })
    const entryOne = generateEntry({ filePath: 'first.cbz', issue: issueOne })
    const entryTwo = generateEntry({ filePath: 'second.cbz', issue: issueTwo })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entryOne.filePath, entryOne)
    await subject.setEntry('/rachel-rising', entryTwo.filePath, entryTwo)
    await subject.deleteEntry('/rachel-rising', entryOne.filePath)

    const retrieved = await subject.getCredit({ source: credit.source, sourceId: credit.sourceId })

    expect(retrieved).toMatchObject(credit)
    expect(retrieved.issues).toHaveLength(1)
  })

  it('creates a volume when creating an issue with a volume', async () => {
    const volume = generateVolume()
    const issue = generateIssue({ volume })
    const entry = generateEntry({ issue })

    await subject.createCollection({ path: '/cool', name: 'cool comix' })
    await subject.setEntry('/cool', entry.filePath, entry)

    const retrievedIssue = await subject.getIssue({ source: issue.source, sourceId: issue.sourceId })
    expect(retrievedIssue.volume).toEqual(volume)

    const retrievedVolume = await subject.getVolume({ source: volume.source, sourceId: volume.sourceId })
    expect(retrievedVolume).toMatchObject({
      ...volume,
      issues: [{
        ...issue,
        volume: undefined,
        characters: undefined,
        concepts: undefined,
        locations: undefined,
        objects: undefined,
        people: undefined,
        storyArcs: undefined,
        teams: undefined,
      }]
    })
  })

  it('can read all volumes in a collection', async () => {
    const volumes = list(generateVolume)
    const issues = volumes.map(volume => generateIssue({ volume }))
    issues.push(generateIssue({ volume: volumes[0]! }))
    const entries = issues.map(issue => generateEntry({ issue }))
    const otherEntry = generateEntry({ issue: generateIssue({ volume: generateVolume() }) })

    await subject.createCollection({ path: '/cool', name: 'cool comix' })
    await subject.createCollection({ path: '/other', name: 'other comix' })

    await Promise.all(entries.map(entry => subject.setEntry('/cool', entry.filePath, entry)))
    await subject.setEntry('/other', otherEntry.filePath, otherEntry)

    const retrievedVolumes = await subject.getVolumes('/cool')

    expect(retrievedVolumes.length).toEqual(volumes.length)
    expect(retrievedVolumes).toEqual(
      expect.arrayContaining(volumes.map(volume => ({
        ...volume,
        issues: undefined
      })))
    )
  })

  it.each([
    {
      plural: 'characters',
      generate: () => generateCredit({ type: 'character' }),
      read: (config: LibraryConfig) => config.getCharacters.bind(config)
    },
    {
      plural: 'concepts',
      generate: () => generateCredit({ type: 'concept' }),
      read: (config: LibraryConfig) => config.getConcepts.bind(config)
    },
    {
      plural: 'locations',
      generate: () => generateCredit({ type: 'location' }),
      read: (config: LibraryConfig) => config.getLocations.bind(config)
    },
    {
      plural: 'objects',
      generate: () => generateCredit({ type: 'object' }),
      read: (config: LibraryConfig) => config.getObjects.bind(config)
    },
    {
      plural: 'people',
      generate: () => generateCredit({ type: 'person' }),
      read: (config: LibraryConfig) => config.getPeople.bind(config)
    },
    {
      plural: 'storyArcs',
      generate: () => generateCredit({ type: 'storyArc' }),
      read: (config: LibraryConfig) => config.getStoryArcs.bind(config)
    },
    {
      plural: 'teams',
      generate: () => generateCredit({ type: 'team' }),
      read: (config: LibraryConfig) => config.getTeams.bind(config)
    },
  ])('can read all credits in a collection by type', async (type) => {
    const credits = list(type.generate)
    const issues = credits.map(credit => generateIssue({ [type.plural]: [credit] }))
    issues.push(generateIssue({ [type.plural]: credits }))
    const entries = issues.map(issue => generateEntry({ issue }))
    const otherEntry = generateEntry({ issue: generateIssue({ [type.plural]: [type.generate()] }) })

    await subject.createCollection({ path: '/cool', name: 'cool comix' })
    await subject.createCollection({ path: '/other', name: 'other comix' })

    await Promise.all(entries.map(entry => subject.setEntry('/cool', entry.filePath, entry)))
    await subject.setEntry('/other', otherEntry.filePath, otherEntry)

    const readFn = type.read(subject)
    const retrievedCredits = await readFn('/cool')

    expect(retrievedCredits.length).toEqual(credits.length)
    expect(retrievedCredits).toEqual(
      expect.arrayContaining(credits)
    )
  })

  it('updates volumes when creating issues with the volume', async () => {
    const volume = generateVolume()
    const issueOne = generateIssue({ volume })
    const issueTwo = generateIssue({ volume })
    const entryOne = generateEntry({ issue: issueOne })
    const entryTwo = generateEntry({ issue: issueTwo })

    await subject.createCollection({ path: '/cool', name: 'cool comix' })
    await subject.setEntry('/cool', entryOne.filePath, entryOne)
    await subject.setEntry('/cool', entryTwo.filePath, entryTwo)

    const retrievedVolume = await subject.getVolume({ source: volume.source, sourceId: volume.sourceId })
    const retrievedVolumeIssues = retrievedVolume.issues!.map(issue => issue.sourceId)

    expect(retrievedVolumeIssues).toHaveLength(2)
    expect(retrievedVolumeIssues).toContain(issueOne.sourceId)
    expect(retrievedVolumeIssues).toContain(issueTwo.sourceId)
  })

  it('removing an entry removes associated volumes', async () => {
    const volume = generateVolume()
    const issue = generateIssue({ volume })
    const entry = generateEntry({ issue })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entry.filePath, entry)
    await subject.deleteEntry('/rachel-rising', entry.filePath)

    const call = subject.getVolume({ source: volume.source, sourceId: volume.sourceId })

    await expect(call).rejects.toEqual(new Error(`Volume "${volume.source}:${volume.sourceId}" does not exist`))
  })

  it('removing an entry removes associated volumes unless another entries issue references them', async () => {
    const volume = generateVolume()
    const issueOne = generateIssue({ volume })
    const issueTwo = generateIssue({ volume })
    const entryOne = generateEntry({ filePath: 'first.cbz', issue: issueOne })
    const entryTwo = generateEntry({ filePath: 'second.cbz', issue: issueTwo })

    await subject.createCollection({ path: '/rachel-rising', name: 'rachel rising' })
    await subject.setEntry('/rachel-rising', entryOne.filePath, entryOne)
    await subject.setEntry('/rachel-rising', entryTwo.filePath, entryTwo)
    await subject.deleteEntry('/rachel-rising', entryOne.filePath)

    const retrieved = await subject.getVolume({ source: volume.source, sourceId: volume.sourceId })

    expect(retrieved).toMatchObject({
      ...volume,
      issues: [{
        ...issueTwo,
        volume: undefined,
        characters: undefined,
        concepts: undefined,
        locations: undefined,
        objects: undefined,
        people: undefined,
        storyArcs: undefined,
        teams: undefined,
      }]
    })
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
    const originalEntry = generateEntry({ filePath: '/comics/file.cbr' })
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

  it('can store reading progress', async () => {
    const collection = { path: '/comics', name: 'Comics' }
    const entry = generateEntry({ filePath: '/comics/file.cbr' })
    const readingProgress = {
      currentPage: faker.datatype.number(),
      pageCount: faker.datatype.number(),
      finished: faker.datatype.boolean(),
    }

    await subject.createCollection(collection)
    await subject.setEntry('/comics', '/comics/file.cbr', entry)
    await subject.setReadingProgress('/comics', '/comics/file.cbr', readingProgress)

    expect(await subject.getEntry('/comics', '/comics/file.cbr')).toMatchObject({
      progress: readingProgress
    })
  })

  it('can reset reading progress', async () => {
    const collection = { path: '/comics', name: 'Comics' }
    const entry = generateEntry({ filePath: '/comics/file.cbr' })

    await subject.createCollection(collection)
    await subject.setEntry('/comics', '/comics/file.cbr', entry)
    await subject.setReadingProgress('/comics', '/comics/file.cbr', undefined)

    expect(await subject.getEntry('/comics', '/comics/file.cbr')).toMatchObject({
      progress: undefined
    })
  })
}

const sortByFileName = (a: LibraryEntry, b: LibraryEntry) =>
  a.fileName < b.fileName ? -1 :
  a.fileName > b.fileName ? 1 : 0
