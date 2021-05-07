import { LibraryEntry, LibraryIssue } from '@comix/library'
import { AnyEffectGenerator } from 'typed-effects'
import {
  firstIssueForEntry,
  tryParseIssueDetails,
  volume,
  search,
  compareEntryToResults,
  issue,
  hasBeenDeferred,
  defer,
} from '../effects'

const MATCH_THRESHOLD = 0.25

export async function* guessComicVineIssueForEntry(entry: LibraryEntry): AnyEffectGenerator<LibraryIssue | null> {
  const issueNumberOneInDirectory = yield* firstIssueForEntry(entry)
  const parsedIssue = yield* tryParseIssueDetails(entry)

  if (issueNumberOneInDirectory && issueNumberOneInDirectory.volume) {
    const firstIssueVolume = yield* volume(Number(issueNumberOneInDirectory.volume.sourceId))
    const issueInFirstIssueVolume = firstIssueVolume.issues.find(issue => issue.number === parsedIssue.number)

    if (issueInFirstIssueVolume === undefined) {
      const results = yield* search(parsedIssue.name)
      const matchResult = yield* compareEntryToResults(entry, results)

      if (matchResult.strongest && matchResult.strongest.score < MATCH_THRESHOLD) {
        if (matchResult.strongest.comparison.type === 'volume') {
          const strongestVol = yield* volume(matchResult.strongest.comparison.comicVineId)
          const issueInFirstIssueVolume = strongestVol.issues.find(issue => issue.number === 1)
          if (!issueInFirstIssueVolume) return null

          return yield* issue(issueInFirstIssueVolume.comicVineId)
        } else {
          return yield* issue(matchResult.strongest.comparison.comicVineId)
        }
      }

      return null
    }

    const currentIssue = yield* issue(issueInFirstIssueVolume?.comicVineId!)
    const matchResult = yield* compareEntryToResults(entry, [currentIssue])

    if (matchResult.strongest && matchResult.strongest.score < MATCH_THRESHOLD)
      return currentIssue

    const results = yield* search(parsedIssue.name)
    const matchResult2 = yield* compareEntryToResults(entry, results)

    if (matchResult2.strongest && matchResult2.strongest.score < MATCH_THRESHOLD) {
      if (matchResult2.strongest.comparison.type === 'volume') {
        const strongestVol = yield* volume(matchResult2.strongest.comparison.comicVineId)
        const issueInFirstIssueVolume = strongestVol.issues.find(issue => issue.number === 1)

        if (!issueInFirstIssueVolume) return null

        return yield* issue(issueInFirstIssueVolume?.comicVineId)
      } else {
        return yield* issue(matchResult2.strongest.comparison.comicVineId)
      }
    }

    return currentIssue
  }

  const deferred = yield* hasBeenDeferred()

  if (deferred || parsedIssue.number === 1 || parsedIssue.number === undefined) {
    const results = yield* search(parsedIssue.name)
    const matchResult = yield* compareEntryToResults(entry, results)

    if (matchResult.strongest && matchResult.strongest.score < MATCH_THRESHOLD) {
      if (matchResult.strongest.comparison.type === 'volume') {
        const strongestVol = yield* volume(matchResult.strongest.comparison.comicVineId)
        const issueInFirstIssueVolume = strongestVol.issues.find(issue => issue.number === 1)

        if (!issueInFirstIssueVolume) return null

        return yield* issue(issueInFirstIssueVolume?.comicVineId)
      } else {
        return yield* issue(matchResult.strongest.comparison.comicVineId)
      }
    }

    return null
  } else {
    yield* defer()
    return null
  }
}
