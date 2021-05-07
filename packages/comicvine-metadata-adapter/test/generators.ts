import path from 'path'
import faker from 'faker'
import { Comic } from '@comix/parser'
import {
  LibraryCollection,
  LibraryCreditBase,
  LibraryCreditCharacter,
  LibraryCreditConcept,
  LibraryCreditLocation,
  LibraryCreditObject,
  LibraryCreditPerson,
  LibraryCreditStoryArc,
  LibraryCreditTeam,
  LibraryEntry,
  LibraryIssue,
} from '@comix/library'
import {
  ComicVineIssueSearchResult,
  ComicVineResource,
  ComicVineSearchResult,
  ComicVineVolume,
  ComicVineVolumeSearchResult
} from '../src/types'

export const pick = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)]
}

export const list = <T>(fn: () => T, numElements: number = 3) => {
  const results = [] as T[]
  for (let i = 0; i < numElements; i++) results.push(fn())
  return results
}

export const generateEntry = (overrides: Partial<LibraryEntry> = {}): LibraryEntry => ({
  fileName: faker.system.fileName(),
  filePath: faker.system.filePath(),
  fileLastModified: faker.date.past().getTime(),
  fileLastProcessed: faker.date.past().getTime(),
  corrupt: faker.datatype.boolean(),
  coverFileName: faker.system.fileName() + '.jpg',
  adaptions: [],
  ...overrides,
})

export const generateEntryInDirectory = (dirpath: string): LibraryEntry =>
  generateEntry({ filePath: path.join(dirpath, faker.system.fileName()) })

export const generateComic = (overrides: Partial<Comic> = {}): Comic => ({
  name: faker.system.fileName(),
  images: [],
  ...overrides,
})

export const generateCollection = (overrides: Partial<Comic> = {}): LibraryCollection => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
  ...overrides,
})

export const generateCvVolume = (overrides: Partial<ComicVineVolume> = {}): ComicVineVolume => ({
  comicVineApiResponse: {} as any,
  comicVineId: faker.datatype.number(),
  issues: list(() => ({
    name: faker.lorem.sentence(),
    number: faker.datatype.number(),
    comicVineId: faker.datatype.number(),
    comicVineApiUrl: 'https://example.com',
  })),
  ...overrides,
})

export const generateIssue = (overrides: Partial<LibraryIssue> = {}): LibraryIssue => ({
  source: 'TEST',
  sourceId: faker.datatype.uuid(),
  coverDate: faker.datatype.datetime(),
  issueNumber: faker.datatype.number(),
  imageUrl: 'https://example.com/whatever.jpg',
  name: faker.lorem.sentence(),
  characters: list(() => generateCredit({ type: 'character' })) as LibraryCreditCharacter[],
  concepts: list(() => generateCredit({ type: 'concept' })) as LibraryCreditConcept[],
  locations: list(() => generateCredit({ type: 'location' })) as LibraryCreditLocation[],
  objects: list(() => generateCredit({ type: 'object' })) as LibraryCreditObject[],
  people: list(() => generateCredit({ type: 'person', roles: list(faker.lorem.word) })) as LibraryCreditPerson[],
  storyArcs: list(() => generateCredit({ type: 'storyArc' })) as LibraryCreditStoryArc[],
  teams: list(() => generateCredit({ type: 'team' })) as LibraryCreditTeam[],
  ...overrides,
})

export const generateCvSearchResults = (): ComicVineSearchResult[] => {
  return [
    ...list(generateCvIssueSearchResult),
    ...list(generateCvVolumeSearchResult),
  ]
}

export const generateCvIssueSearchResult = (overrides: Partial<ComicVineIssueSearchResult> = {}): ComicVineIssueSearchResult => ({
  comicVineId: faker.datatype.number(),
  comicVineApiUrl: 'https://example.com/api/issue',
  type: 'issue',
  coverDate: faker.datatype.datetime(),
  issueNumber: faker.datatype.number(),
  volume: generateCvResource({}),
})

export const generateCvVolumeSearchResult = (overrides: Partial<ComicVineVolumeSearchResult> = {}): ComicVineVolumeSearchResult => ({
  comicVineId: faker.datatype.number(),
  comicVineApiUrl: 'https://example.com/api/volume',
  type: 'volume',
  startYear: faker.date.past().getFullYear(),
  numberOfIssues: faker.datatype.number(),
  publisher: generateCvResource({}),
  firstIssue: generateCvResource<ComicVineResource & { issueNumber: number }>({ issueNumber: faker.datatype.number() }),
  lastIssue: generateCvResource<ComicVineResource & { issueNumber: number }>({ issueNumber: faker.datatype.number() }),
})

const generateCredit = (overrides: Partial<LibraryCreditBase> & { [key: string]: any }): LibraryCreditBase => {
  return {
    type: 'unknown',
    source: 'TEST',
    sourceId: faker.datatype.uuid(),
    name: faker.lorem.sentence(),
    ...overrides,
  }
}

const generateCvResource = <T extends ComicVineResource>(overrides: Omit<T, keyof ComicVineResource>): T => {
  return {
    name: faker.lorem.sentence(),
    comicVineId: faker.datatype.number(),
    comicVineApiUrl: 'https://example.com',
    ...overrides,
  } as any
}
