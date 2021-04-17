import { ArchiveEntry } from '../protocols'

export function entryIsPage(entry: ArchiveEntry) {
  const isNotDsStore = () => !entry.name.endsWith('.DS_Store')
  const isNotMacFile = () => !entry.name.startsWith('__MACOSX/')
  const isNotDirectory = () => !entry.isDirectory

  return isNotDsStore() && isNotMacFile() && isNotDirectory()
}

export function sortByAsc<T>(key: keyof T) {
  return (a: T, b: T) => {
    if (a[key] < b[key]) return -1
    if (a[key] > b[key]) return 1
    return 0
  }
}
