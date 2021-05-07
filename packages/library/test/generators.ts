import faker from 'faker'
import { LibraryCredit, LibraryCreditBase, LibraryCreditPerson, LibraryEntry, LibraryIssue, LibraryVolume } from '../src/protocols'
import { fixturePath } from './helpers'

export const pick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const list = <T>(fn: () => T, numElements: number = 3) => {
  const results = [] as T[]
  for (let i = 0; i < numElements; i++) results.push(fn())
  return results
}

export const generateEntry = (overrides: Partial<LibraryEntry> = {}): LibraryEntry => {
  const filename = `example-comic-${Math.random()}.cbz`

  return {
    fileName: filename,
    filePath: fixturePath(filename),
    fileLastModified: 123,
    fileLastProcessed: 456,
    corrupt: false,
    coverFileName: undefined,
    adaptions: [],
    issue: undefined,
    ...overrides,
  }
}

export const generateIssue = (overrides: Partial<LibraryIssue> = {}): LibraryIssue => {
  return {
    source: 'test',
    sourceId: faker.datatype.uuid(),
    sourceMetadata: {},
    volume: generateVolume(),
    coverDate: faker.datatype.datetime(),
    issueNumber: faker.datatype.number(),
    imageUrl: undefined,
    name: faker.lorem.sentence(),
    characters: [],
    concepts: [],
    locations: [],
    objects: [],
    people: [],
    storyArcs: [],
    teams: [],
    ...overrides,
  }
}

export const generateVolume = (overrides: Partial<LibraryVolume> = {}): LibraryVolume => {
  return {
    source: 'test',
    sourceId: faker.datatype.uuid(),
    name: faker.lorem.sentence(),
    issues: undefined,
    ...overrides,
  }
}

export const generatePersonCredit = (overrides: Partial<LibraryCreditPerson> = {}): LibraryCreditPerson => {
  return {
    source: 'test',
    sourceId: faker.datatype.uuid(),
    type: 'person',
    roles: list(faker.lorem.word),
    ...overrides || {},
  }
}

export const generateCredit = (overrides?: Partial<LibraryCreditBase>): LibraryCreditBase => {
  return {
    source: 'test',
    sourceId: faker.datatype.uuid(),
    type: pick(['object', 'character', 'concept', 'location', 'storyArc', 'team']),
    ...overrides || {},
  }
}
