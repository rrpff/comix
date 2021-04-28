import { LibraryCollection, LibraryEntry } from '../src/types/apiSchema'
import faker from 'faker'

export const pick = faker.random.arrayElement.bind(faker.random)

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
