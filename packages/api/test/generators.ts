import { LibraryCollection, LibraryCreditBase, LibraryCreditPerson, LibraryEntry, LibraryIssue, LibraryReadingProgress, LibraryVolume } from '@comix/library'
import faker from 'faker'

export const optional = <T>(fn: () => T): T | undefined =>
  Math.random() > 0.5 ? fn() : undefined

export const pick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const list = <T>(fn: () => T, numElements: number = 3) => {
  const results = [] as T[]
  for (let i = 0; i < numElements; i++) results.push(fn())
  return results
}

export const generateCollection = (): LibraryCollection => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})

export const generateEntry = (overrides: Partial<LibraryEntry> = {}): LibraryEntry => ({
  fileName: faker.system.fileName(),
  filePath: faker.system.fileName(),
  fileLastModified: faker.date.past().getTime(),
  fileLastProcessed: faker.date.past().getTime(),
  corrupt: faker.datatype.boolean(),
  coverFileName: faker.system.fileName() + '.jpg',
  volumeName: optional(faker.lorem.sentence),
  volumeYear: optional(() => faker.date.past().getFullYear()),
  adaptions: [],
  ...overrides,
})

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

export const generateReadingProgress = (overrides?: Partial<LibraryReadingProgress>): LibraryReadingProgress => {
  return {
    pageCount: faker.datatype.number(),
    currentPage: faker.datatype.number(),
    finished: faker.datatype.boolean(),
    ...overrides || {},
  }
}
