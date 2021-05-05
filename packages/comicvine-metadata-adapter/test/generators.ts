import path from 'path'
import faker from 'faker'
import { LibraryCollection, LibraryEntry } from '@comix/library'
import { Comic } from '@comix/parser'
import {
  ComicVineCharacter,
  ComicVineConcept,
  ComicVineIssue,
  ComicVineIssueSearchResult,
  ComicVineLocation,
  ComicVineObject,
  ComicVinePerson,
  ComicVineResource,
  ComicVineSearchResult,
  ComicVineStoryArc,
  ComicVineTeam,
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

export const generateCvIssue = (overrides: Partial<ComicVineIssue> = {}): ComicVineIssue => ({
  comicVineApiResponse: {} as any,
  coverDate: faker.datatype.datetime(),
  comicVineId: faker.datatype.number(),
  issueNumber: faker.datatype.number(),
  imageUrl: 'https://example.com/whatever.jpg',
  name: faker.lorem.sentence(),
  characters: list(() => generateCvResource<ComicVineCharacter>({ type: 'character' })),
  concepts: list(() => generateCvResource<ComicVineConcept>({ type: 'concept' })),
  locations: list(() => generateCvResource<ComicVineLocation>({ type: 'location' })),
  objects: list(() => generateCvResource<ComicVineObject>({ type: 'object' })),
  people: list(() => generateCvResource<ComicVinePerson>({ type: 'person', roles: list(faker.lorem.word) })),
  storyArcs: list(() => generateCvResource<ComicVineStoryArc>({ type: 'storyArc' })),
  teams: list(() => generateCvResource<ComicVineTeam>({ type: 'team' })),
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

const generateCvResource = <T extends ComicVineResource>(overrides: Omit<T, keyof ComicVineResource>): T => {
  return {
    name: faker.lorem.sentence(),
    comicVineId: faker.datatype.number(),
    comicVineApiUrl: 'https://example.com',
    ...overrides,
  } as any
}
