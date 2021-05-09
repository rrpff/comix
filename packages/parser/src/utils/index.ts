import { ArchiveEntry } from '../protocols'

const IMAGE_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
]

export function entryIsPage(entry: ArchiveEntry) {
  const isNotDsStore = () => !entry.name.endsWith('.DS_Store')
  const isNotMacFile = () => !entry.name.startsWith('__MACOSX/')
  const isNotDirectory = () => !entry.isDirectory
  const isImage = () => IMAGE_EXTENSIONS.some(ext => entry.name.endsWith(ext))

  return isNotDsStore() && isNotMacFile() && isNotDirectory() && isImage()
}

export function sortByAsc<T>(key: keyof T) {
  return (a: T, b: T) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  }
}

export function isBrowser() {
  return typeof window !== 'undefined'
}
