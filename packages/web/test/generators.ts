import { File, Directory, LibraryCollection, LibraryEntry, LibraryIssue, LibraryCredit, LibraryCreditPerson, LibraryVolume } from '@comix/ui'
import faker from 'faker'

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

export const generateEntry = (): LibraryEntry => ({
  fileName: faker.system.fileName(),
  filePath: faker.system.filePath(),
  fileLastModified: faker.date.past().getTime(),
  fileLastProcessed: faker.date.past().getTime(),
  corrupt: faker.datatype.boolean(),
  coverFileName: faker.system.fileName() + '.jpg',
})

export const generateFile = (): File => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
})

export const generateDirectory = (levels: number = 1): Directory => ({
  name: faker.system.fileName(),
  path: faker.system.filePath(),
  files: list(generateFile),
  directories: levels > 0
    ? list(() => generateDirectory(levels - 1))
    : []
})

export const generateIssue = (overrides: Partial<LibraryIssue> = {}): LibraryIssue => {
  return {
    source: 'test',
    sourceId: faker.datatype.uuid(),
    volume: generateVolume(),
    coverDate: faker.datatype.datetime(),
    issueNumber: faker.datatype.number(),
    name: faker.lorem.sentence(),
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

export const generateCredit = (overrides?: Partial<LibraryCredit>): LibraryCredit => {
  return {
    source: 'test',
    sourceId: faker.datatype.uuid(),
    name: faker.lorem.sentence(),
    type: pick(['object', 'character', 'concept', 'location', 'storyArc', 'team']),
    ...overrides || {},
  }
}
