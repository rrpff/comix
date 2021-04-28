import { LibraryCollection, LibraryEntry } from '@comix/library'
import faker from 'faker'

export const optional = <T>(fn: () => T): T | undefined =>
  Math.random() > 0.5 ? fn() : undefined

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
  filePath: faker.system.fileName(),
  fileLastModified: faker.date.past().getTime(),
  fileLastProcessed: faker.date.past().getTime(),
  corrupt: faker.datatype.boolean(),
  coverFileName: faker.system.fileName() + '.jpg',
  volumeName: optional(faker.lorem.sentence),
  volumeYear: optional(() => faker.date.past().getFullYear()),
  adaptions: []
})
