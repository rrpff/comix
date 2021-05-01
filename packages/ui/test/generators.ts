import faker from 'faker'
import { LibraryCollection, LibraryEntry, File, Directory } from '../src/types/apiSchema'

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
