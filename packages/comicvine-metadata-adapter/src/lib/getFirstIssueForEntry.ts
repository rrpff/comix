import path from 'path'
import { Library, LibraryCollection, LibraryEntry } from '@comix/library'
import { EffectResponse } from 'typed-effects'
import { closest } from 'fastest-levenshtein'
import { FirstIssueForEntryEffect } from '../effects'

type Result = EffectResponse<FirstIssueForEntryEffect>

export const getFirstIssueForEntry = async (library: Library, collection: LibraryCollection, entry: LibraryEntry): Promise<Result> => {
  const allEntries = await library.config.getEntries(collection.path)
  const matchingEntries = allEntries
    .filter(other => path.dirname(other.filePath) === path.dirname(entry.filePath))
    .filter(other => other.issue !== undefined)
    .filter(other => other.issue!.source === 'COMIC_VINE')
    .filter(other => other.issue!.issueNumber === 1)

  if (matchingEntries.length === 0) return null
  if (matchingEntries.length === 1) return matchingEntries[0].issue!

  const chosenEntryName = closest(entry.fileName, matchingEntries.map(entry => entry.fileName))
  const chosenEntry = matchingEntries.find(entry => entry.fileName === chosenEntryName)

  return chosenEntry!.issue!
}
