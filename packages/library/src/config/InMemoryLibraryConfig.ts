import path from 'path'
import {
  LibraryCollection,
  LibraryConfig,
  LibraryCreditBase,
  LibraryCreditCharacter,
  LibraryCreditConcept,
  LibraryCreditLocation,
  LibraryCreditObject,
  LibraryCreditPerson,
  LibraryCreditStoryArc,
  LibraryCreditTeam,
  LibraryEntry,
  LibraryIdentifier,
  LibraryIssue,
  LibraryVolume,
} from '../protocols'

type CreditKeys = 'characters' | 'concepts' | 'locations' | 'objects' | 'people' | 'storyArcs' | 'teams'
type EntryIdentifier = { collectionPath: string, entryPath: string }

interface PersistedLibraryEntry extends Omit<LibraryEntry, 'issue'> {
  issue?: LibraryIdentifier
}

interface PersistedLibraryIssue extends Omit<LibraryIssue, 'volume' | 'entries' | CreditKeys> {
  entries: EntryIdentifier[]
  credits: { source: string, sourceId: string }[]
  volume?: LibraryIdentifier
}

interface PersistedLibraryCredit extends Omit<LibraryCreditBase, 'issues'> {
  issues: LibraryIdentifier[]
}

interface PersistedLibraryVolume extends Omit<LibraryVolume, 'issues'> {
  issues: LibraryIdentifier[]
}

export class InMemoryLibraryConfig implements LibraryConfig {
  private config = {
    imagesDirectoryPath: null as string | null,
    collections: [] as LibraryCollection[],
    entries: {} as { [key: string]: { [key: string]: PersistedLibraryEntry } },
    issues: {} as { [key: string]: PersistedLibraryIssue },
    credits: {} as { [key: string]: PersistedLibraryCredit },
    volumes: {} as { [key: string]: PersistedLibraryVolume },
  }

  public async load(): Promise<LibraryConfig> {
    return this
  }

  public async getImagesDirectory(): Promise<string | null> {
    return this.config.imagesDirectoryPath
  }

  public async setImagesDirectory(path: string): Promise<void> {
    this.config.imagesDirectoryPath = path
  }

  public async getCollection(path: string): Promise<LibraryCollection> {
    const collection = this.config.collections.find(c => c.path === path)
    if (!collection) throw new Error(`Collection "${path}" does not exist`)
    return collection
  }

  public async getCollections(): Promise<LibraryCollection[]> {
    return this.config.collections
  }

  public async createCollection(collection: LibraryCollection): Promise<LibraryCollection> {
    const exists = this.config.collections.some(c => c.path === collection.path)
    if (exists) throw new Error(`Collection "${collection.path}" already exists`)

    this.config.collections.push(collection)
    return collection
  }

  public async deleteCollection(collectionPath: string): Promise<void> {
    delete this.config.entries[collectionPath]
    this.config.collections = this.config.collections.filter(c => c.path !== collectionPath)
  }

  public async getEntries(collectionPath: string): Promise<LibraryEntry[]> {
    const entries = Object.values(this.config.entries[collectionPath] || {})
    return await Promise.all(entries.map(async entry => ({ ...entry,
      issue: entry.issue !== undefined
        ? await this.getIssue(entry.issue, true, true, false)
        : undefined
    })))
  }

  public async getEntry(collectionPath: string, entryPath: string, withIssue: boolean = true): Promise<LibraryEntry> {
    try {
      const entry = this.config.entries[collectionPath][entryPath]
      if (entry === undefined) throw ''

      const issue = withIssue && entry.issue !== undefined
        ? await this.getIssue(entry.issue, true, true, false)
        : undefined

      return { ...entry, issue }
    } catch {
      throw new Error(`Entry "${entryPath}" in "${collectionPath}" does not exist`)
    }
  }

  public async setEntry(collectionPath: string, entryPath: string, entry: LibraryEntry): Promise<void> {
    await this.getCollection(collectionPath)

    this.config.entries[collectionPath] = this.config.entries[collectionPath] || {}
    delete this.config.entries[collectionPath][entryPath]
    this.config.entries[collectionPath][entry.filePath] = {
      ...entry,
      issue: entry.issue
        ? { source: entry.issue.source, sourceId: entry.issue.sourceId }
        : undefined
    }

    if (entry.issue) {
      await this.setIssue(entry.issue, collectionPath, entryPath, entry)
    }
  }

  public async deleteEntry(collectionPath: string, entryPath: string): Promise<void> {
    if (this.config.entries[collectionPath]) {
      delete this.config.entries[collectionPath][entryPath]
      this.removeEntryFromIssues(collectionPath, entryPath)
    }
  }

  public async updateCollection(originalPath: string, collection: LibraryCollection): Promise<void> {
    this.config.collections = this.config.collections.map(original => {
      if (original.path === originalPath) return collection
      return original
    })

    this.config.entries[collection.path] = Object.values(this.config.entries[originalPath] || {}).reduce((acc, entry) => {
      const newPath = path.join(collection.path, path.relative(originalPath, entry.filePath))
      const newEntry = { ...entry, filePath: newPath }

      return { ...acc, [newPath]: newEntry }
    }, {})

    delete this.config.entries[originalPath]
  }

  public async getIssue(identifier: LibraryIdentifier, withCredits: boolean = true, withVolume: boolean = true, withEntries: boolean = true): Promise<LibraryIssue> {
    const issue = this.config.issues[`${identifier.source}:${identifier.sourceId}`]

    if (issue === undefined) {
      throw new Error(`Issue "${identifier.source}:${identifier.sourceId}" does not exist`)
    }

    const entries = !withEntries
      ? undefined
      : await Promise.all(issue.entries.map(async identifier => {
          return {
            collectionPath: identifier.collectionPath,
            entry: await this.getEntry(identifier.collectionPath, identifier.entryPath, false)
          }
        }))

    const credits = withCredits
      ? await this.getCredits(issue)
      : []

    const volume = withVolume && issue.volume
      ? await this.getVolume(issue.volume, false)
      : undefined

    return {
      ...issue,
      entries,
      volume,
      characters: withCredits
        ? credits.filter(c => c.type === 'character') as LibraryCreditCharacter[]
        : undefined,
      concepts: withCredits
        ? credits.filter(c => c.type === 'concept') as LibraryCreditConcept[]
        : undefined,
      locations: withCredits
        ? credits.filter(c => c.type === 'location') as LibraryCreditLocation[]
        : undefined,
      objects: withCredits
        ? credits.filter(c => c.type === 'object') as LibraryCreditObject[]
        : undefined,
      people: withCredits
        ? credits.filter(c => c.type === 'person') as LibraryCreditPerson[]
        : undefined,
      storyArcs: withCredits
        ? credits.filter(c => c.type === 'storyArc') as LibraryCreditStoryArc[]
        : undefined,
      teams: withCredits
        ? credits.filter(c => c.type === 'team') as LibraryCreditTeam[]
        : undefined,
    }
  }

  public async getCredit(identifier: LibraryIdentifier): Promise<LibraryCreditBase> {
    const credit = this.config.credits[`${identifier.source}:${identifier.sourceId}`]

    if (credit === undefined) {
      throw new Error(`Credit "${identifier.source}:${identifier.sourceId}" does not exist`)
    }

    const issues = await Promise.all(credit.issues.map(identifier => this.getIssue(identifier, false, true)))

    return { ...credit, issues }
  }

  public async getVolume(identifier: LibraryIdentifier, withIssues: boolean = true): Promise<LibraryVolume> {
    const volume = this.config.volumes[`${identifier.source}:${identifier.sourceId}`]

    if (volume === undefined) {
      throw new Error(`Volume "${identifier.source}:${identifier.sourceId}" does not exist`)
    }

    const issues = withIssues
      ? await Promise.all(volume.issues.map(identifier => this.getIssue(identifier, false, false)))
      : undefined

    return { ...volume, issues }
  }

  private async setIssue(issue: LibraryIssue, collectionPath: string, originalEntryPath: string, entry: LibraryEntry) {
    const issueKey = `${issue.source}:${issue.sourceId}`
    const existingIssue = this.config.issues[issueKey]
    const existingEntries = existingIssue !== undefined
      ? existingIssue.entries.filter(e => !(e.collectionPath === collectionPath && e.entryPath === originalEntryPath))
      : []

    const volumeIdentifier = issue.volume
      ? { source: issue.volume.source, sourceId: issue.volume.sourceId }
      : undefined

    this.config.issues[issueKey] = {
      ...issue,
      credits: [],
      volume: volumeIdentifier,
      entries: [
        ...existingEntries,
        { collectionPath, entryPath: entry.filePath }
      ]
    }

    if (issue.volume) {
      const volumeKey = `${issue.volume.source}:${issue.volume.sourceId}`
      const existingVolume = this.config.volumes[volumeKey]
      const existingIssues = existingVolume !== undefined
        ? existingVolume.issues.filter(i => !(i.source === issue.source && i.sourceId === issue.sourceId))
        : []

      this.config.volumes[volumeKey] = {
        ...issue.volume,
        issues: [
          ...existingIssues,
          { source: issue.source, sourceId: issue.sourceId }
        ]
      }
    }

    const credits = [
      ...(issue.characters || []),
      ...(issue.concepts || []),
      ...(issue.locations || []),
      ...(issue.objects || []),
      ...(issue.people || []),
      ...(issue.storyArcs || []),
      ...(issue.teams || []),
    ]

    await this.setCredits(credits, issue)
  }

  private async setCredits(credits: LibraryCreditBase[], issue: LibraryIssue) {
    await Promise.all(credits.map(credit => this.setCredit(credit, issue)))
  }

  private async getCredits(issue: PersistedLibraryIssue) {
    return Object.values(this.config.credits)
      .filter(credit => credit.issues.some(i => i.source === issue.source && i.sourceId === issue.sourceId))
      .map(credit => without(credit, ['issues']))
  }

  private async setCredit(credit: LibraryCreditBase, issue: LibraryIssue) {
    const creditKey = `${credit.source}:${credit.sourceId}`
    const existingCredit = this.config.credits[creditKey]
    const existingIssues = existingCredit !== undefined
      ? existingCredit.issues.filter(i => !(i.source === issue.source && i.sourceId === issue.sourceId))
      : []

    this.config.credits[creditKey] = {
      ...credit,
      issues: [
        ...existingIssues,
        { source: issue.source, sourceId: issue.sourceId }
      ]
    }
  }

  private removeEntryFromIssues(collectionPath: string, entryPath: string) {
    Object.keys(this.config.issues).forEach(key => {
      const matchesEntry = (identifier: EntryIdentifier) =>
        identifier.collectionPath === collectionPath && identifier.entryPath === entryPath

      const entriesForIssue = this.config.issues[key].entries
      const removeIssue = entriesForIssue.every(matchesEntry)

      this.config.issues[key].entries = this.config.issues[key].entries
        .filter(identifier => !matchesEntry(identifier))

      if (removeIssue) {
        delete this.config.issues[key]
        this.removeIssueFromCredits(key)
        this.removeIssueFromVolume(key)
      }
    })
  }

  private removeIssueFromCredits(issueKey: string) {
    const [issueSource, issueSourceId] = issueKey.split(':')

    Object.keys(this.config.credits).forEach(key => {
      const matchesIssue = (identifier: LibraryIdentifier) =>
        identifier.source === issueSource && identifier.sourceId === issueSourceId

      const issuesForCredit = this.config.credits[key].issues
      const remove = issuesForCredit.every(matchesIssue)

      this.config.credits[key].issues = this.config.credits[key].issues
        .filter(identifier => !matchesIssue(identifier))

      if (remove) delete this.config.credits[key]
    })
  }

  private removeIssueFromVolume(issueKey: string) {
    const [issueSource, issueSourceId] = issueKey.split(':')

    Object.keys(this.config.volumes).forEach(key => {
      const matchesIssue = (identifier: LibraryIdentifier) =>
        identifier.source === issueSource && identifier.sourceId === issueSourceId

      const issuesForVolume = this.config.volumes[key].issues
      const remove = issuesForVolume.every(matchesIssue)

      this.config.volumes[key].issues = this.config.volumes[key].issues
        .filter(identifier => !matchesIssue(identifier))

      if (remove) delete this.config.volumes[key]
    })
  }
}

const without = <T>(obj: T, remove: string[]) => {
  return Object.keys(obj).reduce((acc: T, key: string) => {
    if (remove.includes(key)) return acc
    return { ...acc, [key]: obj[key as keyof T] }
  }, {} as T)
}
