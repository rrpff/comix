import path from 'path'
import Datastore from 'nedb-promises'
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

export const DEFAULT_JSON_CONFIG = {
  imagesDirectoryPath: null,
  collections: [],
  entries: {}
}

const CREDIT_KEYS = ['characters', 'concepts', 'locations', 'objects', 'people', 'storyArcs', 'teams']
type CreditKeys = 'characters' | 'concepts' | 'locations' | 'objects' | 'people' | 'storyArcs' | 'teams'

type EntryIdentifier = { collectionPath: string, entryPath: string }
type PersistedIssue = Omit<LibraryIssue, 'volume' | 'entries' | CreditKeys>
type PersistedCredit = Omit<LibraryCreditBase, 'issues'>
type PersistedVolume = Omit<LibraryVolume, 'issues'>

type SettingDoc = { type: 'setting', key: string, value: any }
type CollectionDoc = { type: 'collection', collection: LibraryCollection }
type EntryDoc = { type: 'entry', issue?: LibraryIdentifier, collection: string, entry: LibraryEntry }
type IssueDoc = { type: 'issue', entries: EntryIdentifier[], volume: LibraryIdentifier, issue: PersistedIssue }
type CreditDoc = { type: 'credit', issues: LibraryIdentifier[], credit: PersistedCredit }
type VolumeDoc = { type: 'volume', issues: LibraryIdentifier[], volume: PersistedVolume }

export class FileLibraryConfig implements LibraryConfig {
  private db: Datastore

  constructor(filePath: string) {
    this.db = Datastore.create({ filename: filePath })
  }

  public async getImagesDirectory(): Promise<string | null> {
    const settings = await this.db.find<SettingDoc>({ type: 'setting', key: 'images-directory' })
    return settings.length > 0 ? settings[0].value : null
  }

  public async setImagesDirectory(path: string): Promise<void> {
    await this.db.remove({ type: 'setting', key: 'images-directory' }, { multi: true })
    await this.db.insert({ type: 'setting', key: 'images-directory', value: path })
  }

  public async getCollection(path: string): Promise<LibraryCollection> {
    const doc = await this.db.findOne<CollectionDoc>({ type: 'collection', 'collection.path': path })
    if (!doc) throw new Error(`Collection "${path}" does not exist`)

    return doc.collection
  }

  public async getCollections(): Promise<LibraryCollection[]> {
    return (await this.db.find<CollectionDoc>({ type: 'collection' })).map(r => r.collection)
  }

  public async createCollection(collection: LibraryCollection): Promise<LibraryCollection> {
    const doc = await this.db.findOne<CollectionDoc>({ type: 'collection', 'collection.path': collection.path })
    if (doc) throw new Error(`Collection "${collection.path}" already exists`)

    return (await this.db.insert<CollectionDoc>({ type: 'collection', collection })).collection
  }

  public async deleteCollection(collectionPath: string): Promise<void> {
    await this.db.remove({ type: 'collection', 'collection.path': collectionPath }, { multi: true })
  }

  public async getEntries(collectionPath: string): Promise<LibraryEntry[]> {
    const docs = await this.db.find<EntryDoc>({ type: 'entry', collection: collectionPath })
    return await Promise.all(docs.map(async doc => {
      if (doc.issue === undefined) return doc.entry

      const issue = await this.getIssue(doc.issue, true, true, false)
      return { ...doc.entry, issue }
    }))
  }

  public async getEntry(collectionPath: string, entryPath: string, withIssue: boolean = true): Promise<LibraryEntry> {
    const query = { type: 'entry', collection: collectionPath, 'entry.filePath': entryPath }
    const doc = await this.db.findOne<EntryDoc>(query)
    if (!doc) throw new Error(`Entry "${entryPath}" in "${collectionPath}" does not exist`)

    const issue = withIssue && doc.issue !== undefined
      ? await this.getIssue(doc.issue, true, true, false)
      : undefined

    return { ...doc.entry, issue }
  }

  public async setEntry(collectionPath: string, entryPath: string, entry: LibraryEntry): Promise<void> {
    await this.getCollection(collectionPath)
    await this.db.remove({ type: 'entry', collection: collectionPath, 'entry.filePath': entryPath }, { multi: true })

    const issue = entry.issue !== undefined
      ? { source: entry.issue.source, sourceId: entry.issue.sourceId }
      : undefined

    await this.db.insert<EntryDoc>({ type: 'entry', issue, collection: collectionPath, entry: without(entry, ['issue']) })

    if (entry.issue) {
      await this.setIssue(collectionPath, entryPath, entry, entry.issue)
    }
  }

  public async getIssue(identifier: LibraryIdentifier, withCredits: boolean = true, withVolume: boolean = true, withEntries: boolean = true): Promise<LibraryIssue> {
    const query = { type: 'issue', 'issue.source': identifier.source, 'issue.sourceId': identifier.sourceId }
    const doc = await this.db.findOne<IssueDoc>(query)
    if (!doc) throw new Error(`Issue "${identifier.source}:${identifier.sourceId}" does not exist`)

    const entries = !withEntries
      ? undefined
      : await Promise.all(doc.entries.map(async identifier => {
        const entry = await this.getEntry(identifier.collectionPath, identifier.entryPath, false)
        return { collectionPath: identifier.collectionPath, entry }
      }))

    const credits = withCredits
      ? await this.getCreditsFor(identifier)
      : []

    const volume = withVolume && doc.volume
      ? await this.getVolume(doc.volume, false)
      : undefined

    return {
      ...doc.issue,
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

  private async getCreditsFor(issueIdentifier: LibraryIdentifier): Promise<LibraryCreditBase[]> {
    const docs = await this.db.find<CreditDoc>({ type: 'credit', issues: { $elemMatch: issueIdentifier } })
    return docs.map(doc => doc.credit)
  }

  public async getVolume(identifier: LibraryIdentifier, withIssues: boolean = true): Promise<LibraryVolume> {
    const volumeQuery = { type: 'volume', 'volume.source': identifier.source, 'volume.sourceId': identifier.sourceId }
    const doc = await this.db.findOne<VolumeDoc>(volumeQuery)
    if (!doc) throw new Error(`Volume "${identifier.source}:${identifier.sourceId}" does not exist`)

    const issues = withIssues
      ? await Promise.all(doc.issues.map(issueIdentifier => this.getIssue(issueIdentifier, false, false, true)))
      : undefined

    return { ...doc.volume, issues }
  }

  // TODO: index volumes by collections properly
  public async getVolumes(collectionPath: string): Promise<LibraryVolume[]> {
    const entries = await this.getEntries(collectionPath)
    const issues = await Promise.all(entries.map(entry => entry.issue))
    const volumeIdentifiers = uniq(
      issues.map(issue => issue?.volume).filter(volume => volume !== undefined),
      (a, b) => a?.source === b?.source && a?.sourceId === b?.sourceId,
    )

    return await Promise.all(
      volumeIdentifiers.map(volume => this.getVolume(volume!, false))
    )
  }

  public async getCharacters(collectionPath: string): Promise<LibraryCreditCharacter[]> {
    const results = await this.getCredits(collectionPath, issue => issue.characters || [])
    return results as LibraryCreditCharacter[]
  }

  public async getConcepts(collectionPath: string): Promise<LibraryCreditConcept[]> {
    const results = await this.getCredits(collectionPath, issue => issue.concepts || [])
    return results as LibraryCreditConcept[]
  }

  public async getLocations(collectionPath: string): Promise<LibraryCreditLocation[]> {
    const results = await this.getCredits(collectionPath, issue => issue.locations || [])
    return results as LibraryCreditLocation[]
  }

  public async getObjects(collectionPath: string): Promise<LibraryCreditObject[]> {
    const results = await this.getCredits(collectionPath, issue => issue.objects || [])
    return results as LibraryCreditObject[]
  }

  public async getPeople(collectionPath: string): Promise<LibraryCreditPerson[]> {
    const results = await this.getCredits(collectionPath, issue => issue.people || [])
    return results as LibraryCreditPerson[]
  }

  public async getStoryArcs(collectionPath: string): Promise<LibraryCreditStoryArc[]> {
    const results = await this.getCredits(collectionPath, issue => issue.storyArcs || [])
    return results as LibraryCreditStoryArc[]
  }

  public async getTeams(collectionPath: string): Promise<LibraryCreditTeam[]> {
    const results = await this.getCredits(collectionPath, issue => issue.teams || [])
    return results as LibraryCreditTeam[]
  }

  public async getCredit(identifier: LibraryIdentifier, withIssues: boolean = true): Promise<LibraryCreditBase> {
    const creditQuery = { type: 'credit', 'credit.source': identifier.source, 'credit.sourceId': identifier.sourceId }
    const doc = await this.db.findOne<CreditDoc>(creditQuery)
    if (!doc) throw new Error(`Credit "${identifier.source}:${identifier.sourceId}" does not exist`)

    const issues = withIssues
      ? await Promise.all(doc.issues.map(issueIdentifier => this.getIssue(issueIdentifier, false, true)))
      : undefined

    return { ...doc.credit, issues }
  }

  public async deleteEntry(collectionPath: string, entryPath: string): Promise<void> {
    await this.db.remove(
      { type: 'entry', collection: collectionPath, 'entry.filePath': entryPath },
      { multi: true },
    )

    const affectedIssueDocs = await this.db.find<IssueDoc>(
      { type: 'issue', entries: { collectionPath, entryPath } }
    )

    await this.db.update<IssueDoc>(
      { type: 'issue' },
      { $pull: { entries: { collectionPath, entryPath } } },
      { multi: true }
    )

    await this.db.remove({ type: 'issue', entries: { $size: 0 } }, { multi: true })

    await Promise.all(affectedIssueDocs.map(async issue => {
      const identifier = { source: issue.issue.source, sourceId: issue.issue.sourceId }

      const currentIssueDoc = await this.db.findOne<IssueDoc>(
        { type: 'issue', 'issue.source': identifier.source, 'issue.sourceId': identifier.sourceId }
      )

      if (!currentIssueDoc) {
        await this.db.update({ type: 'credit' }, { $pull: { issues: identifier } })
        await this.db.update({ type: 'volume' }, { $pull: { issues: identifier } })
      }
    }))

    await this.db.remove({ type: 'credit', issues: { $size: 0 } }, { multi: true })
    await this.db.remove({ type: 'volume', issues: { $size: 0 } }, { multi: true })
  }

  public async updateCollection(originalPath: string, collection: LibraryCollection): Promise<void> {
    const entries = await this.getEntries(originalPath)
    const newEntries = entries.map(entry => {
      const relativePath = path.relative(originalPath, entry.filePath)
      const newPath = path.join(collection.path, relativePath)

      return { ...entry, filePath: newPath }
    })

    await this.db.remove({ type: 'collection', 'collection.path': originalPath }, { multi: true })
    await this.db.remove({ type: 'entry', collection: originalPath }, { multi: true })
    await this.db.insert<CollectionDoc>({ type: 'collection', collection })
    await this.db.insert<EntryDoc[]>(newEntries.map(entry => (
      { type: 'entry', collection: collection.path, entry }
    )))
  }

  private async setIssue(collectionPath: string, entryPath: string, entry: LibraryEntry, issue: LibraryIssue) {
    const entryIdentifier = { collectionPath, entryPath: entry.filePath }
    const volumeIdentifier = issue.volume !== undefined
      ? { source: issue.volume.source, sourceId: issue.volume.sourceId }
      : undefined

    const query = { type: 'issue', 'issue.source': issue.source, 'issue.sourceId': issue.sourceId }
    const removeOldEntryOperation = { $pull: { entries: { collectionPath, entryPath } } }
    const upsertOperation = {
      $set: { type: 'issue', volume: volumeIdentifier, issue: without(issue, ['volume', 'entries', ...CREDIT_KEYS]) },
      $addToSet: { entries: entryIdentifier },
    }

    await this.db.update<IssueDoc>(query, removeOldEntryOperation)
    await this.db.update<IssueDoc>(query, upsertOperation, { upsert: true })

    const credits = [
      ...(issue.characters || []),
      ...(issue.concepts || []),
      ...(issue.locations || []),
      ...(issue.objects || []),
      ...(issue.people || []),
      ...(issue.storyArcs || []),
      ...(issue.teams || []),
    ]

    await this.setVolumeForIssue(issue)
    await this.setCredits(credits, issue)
  }

  private async setVolumeForIssue(issue: LibraryIssue) {
    if (issue.volume === undefined) return

    const volume = issue.volume
    const query = { type: 'volume', 'volume.source': volume.source, 'volume.sourceId': volume.sourceId }
    const upsertOperation = {
      $set: { type: 'volume', volume: without(volume, ['issues']) },
      $addToSet: { issues: { source: issue.source, sourceId: issue.sourceId } },
    }

    await this.db.update<VolumeDoc>(query, upsertOperation, { upsert: true })
  }

  private async setCredits(credits: LibraryCreditBase[], issue: LibraryIssue) {
    await Promise.all(credits.map(credit => this.setCredit(credit, issue)))
  }

  private async setCredit(credit: LibraryCreditBase, issue: LibraryIssue) {
    const query = { type: 'credit', 'credit.source': credit.source, 'credit.sourceId': credit.sourceId }
    const upsertOperation = {
      $set: { type: 'credit', credit: without(credit, ['issues']) },
      $addToSet: { issues: { source: issue.source, sourceId: issue.sourceId } },
    }

    await this.db.update<CreditDoc>(query, upsertOperation, { upsert: true })
  }

  // TODO: index credits by collections properly
  private async getCredits(collectionPath: string, read: (issue: LibraryIssue) => LibraryCreditBase[]) { // TODO: not any
    const entries = await this.getEntries(collectionPath)
    const issues = await Promise.all(entries.map(entry => entry.issue))
    const issuesCredits = issues.filter(issue => issue !== undefined).map(issue => read(issue!))
    const credits = flatMap(issuesCredits, credit => credit)
    const creditIdentifiers = uniq(credits,
      (a, b) => a?.source === b?.source && a?.sourceId === b?.sourceId,
    )

    return await Promise.all(
      creditIdentifiers.map(credit => this.getCredit(credit, false))
    )
  }
}

const without = <T>(obj: T, remove: string[]) => {
  return Object.keys(obj).reduce((acc: T, key: string) => {
    if (remove.includes(key)) return acc
    return { ...acc, [key]: obj[key as keyof T] }
  }, {} as T)
}

const uniq = <T>(arr: T[], compare: (a: T, b: T) => boolean) => {
  return arr.reduce((acc, elem) => {
    if (acc.some(e => compare(e, elem))) return acc
    return [...acc, elem]
  }, [] as T[])
}

const flatMap = <T, R>(arr: T[][], mapper: (elem: T) => R): R[] => {
  return arr.reduce((acc, subarr) => {
    return [...acc, ...subarr.map(mapper)]
  }, [] as R[])
}
