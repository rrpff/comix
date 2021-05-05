import { LibraryEntry } from '@comix/library'
import { Effect, EffectGenerator, AnyEffectGenerator } from 'typed-effects'
import { ParsedIssue } from './parseComicTitles'
import {
  ComicVineSearchResult,
  ComicVineVolume,
  ComicVineIssue,
  ComicVineMatchResult,
  ComicVineMatchable,
} from '../types'

const MATCH_THRESHOLD = 0.1

export async function* getComicDetails(entry: LibraryEntry): AnyEffectGenerator<ComicVineIssue | null> {
  const firstIssue = yield* firstIssueForEntry(entry)
  const parsedIssue = yield* guessIssue(entry)

  if (firstIssue && firstIssue.comicVineVolumeId) {
    const firstIssueVolume = yield* volume(firstIssue.comicVineVolumeId)
    const issueInFirstIssueVolume = firstIssueVolume.issues.find(issue => issue.number === parsedIssue.number)

    if (issueInFirstIssueVolume === undefined) {
      const results = yield* search(parsedIssue.name)
      const matchResult = yield* compareEntryToResults(entry, results)

      if (matchResult.strongest.score < MATCH_THRESHOLD)
        return matchResult.strongest.issue

      return null
    }

    const currentIssue = yield* issue(issueInFirstIssueVolume?.number!) // TODO: _if_ volume issue
    const matchResult = yield* compareEntryToResults(entry, [currentIssue])

    if (matchResult.strongest.score < MATCH_THRESHOLD)
      return currentIssue

    const results = yield* search(parsedIssue.name)
    const matchResult2 = yield* compareEntryToResults(entry, results)

    if (matchResult2.strongest.score < MATCH_THRESHOLD)
      return matchResult2.strongest.issue

    return currentIssue
  }

  const deferred = yield* hasBeenDeferred()

  if (deferred || parsedIssue.number === 1 || parsedIssue.number === undefined) {
    const results = yield* search(parsedIssue.name)
    const matchResult = yield* compareEntryToResults(entry, results)

    if (matchResult.strongest.score < MATCH_THRESHOLD)
      return matchResult.strongest.issue

    return null
  } else {
    yield* defer()
    return null
  }
}

export const SEARCH = Symbol('SEARCH')
export const VOLUME = Symbol('VOLUME')
export const ISSUE = Symbol('ISSUE')
export const COMPARE_ENTRY_TO_RESULTS = Symbol('COMPARE_ENTRY_TO_RESULTS')
export const DEFER = Symbol('DEFER')
export const HAS_BEEN_DEFERRED = Symbol('HAS_BEEN_DEFERRED')
export const FIRST_ISSUE_FOR_ENTRY = Symbol('FIRST_ISSUE_FOR_ENTRY')
export const GUESS_ISSUE = Symbol('GUESS_ISSUE')

export type SearchEffect = Effect<typeof SEARCH, string, ComicVineSearchResult[]>
export function* search(query: string): EffectGenerator<SearchEffect> {
  return yield { type: SEARCH, payload: query }
}

export type VolumeEffect = Effect<typeof VOLUME, number, ComicVineVolume>
export function* volume(id: number): EffectGenerator<VolumeEffect> {
  return yield { type: VOLUME, payload: id }
}

export type IssueEffect = Effect<typeof ISSUE, number, ComicVineIssue>
export function* issue(id: number): EffectGenerator<IssueEffect> {
  return yield { type: ISSUE, payload: id }
}

export type CompareEntryToResultsEffect = Effect<
  typeof COMPARE_ENTRY_TO_RESULTS,
  { entry: LibraryEntry, results: ComicVineMatchable[] },
  ComicVineMatchResult
>
export function* compareEntryToResults(entry: LibraryEntry, results: ComicVineMatchable[])
  : EffectGenerator<CompareEntryToResultsEffect> {
  return yield { type: COMPARE_ENTRY_TO_RESULTS, payload: { entry, results } }
}

export type DeferEffect = Effect<typeof DEFER, null, null>
export function* defer(): EffectGenerator<DeferEffect> {
  return yield { type: DEFER, payload: null }
}

export type HasBeenDeferredEffect = Effect<typeof HAS_BEEN_DEFERRED, null, boolean>
export function* hasBeenDeferred(): EffectGenerator<HasBeenDeferredEffect> {
  return yield { type: HAS_BEEN_DEFERRED, payload: null }
}

export type FirstIssueForEntry = Effect<typeof FIRST_ISSUE_FOR_ENTRY, LibraryEntry, LibraryEntry | null>
export function* firstIssueForEntry(entry: LibraryEntry): EffectGenerator<FirstIssueForEntry> {
  return yield { type: FIRST_ISSUE_FOR_ENTRY, payload: entry }
}

export type GuessIssueEffect = Effect<typeof GUESS_ISSUE, LibraryEntry, ParsedIssue>
export function* guessIssue(entry: LibraryEntry): EffectGenerator<GuessIssueEffect> {
  return yield { type: GUESS_ISSUE, payload: entry }
}
