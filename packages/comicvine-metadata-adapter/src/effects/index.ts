import { Effect, EffectGenerator } from 'typed-effects'
import { LibraryEntry, LibraryIssue } from '@comix/library'
import { ParsedIssue } from '../lib/parseComicTitles'
import { ComicVineMatchResult, ComicVineSearchResult, ComicVineVolume } from '../types'

export const SEARCH = Symbol('SEARCH')
export const VOLUME = Symbol('VOLUME')
export const ISSUE = Symbol('ISSUE')
export const COMPARE_ENTRY_TO_RESULTS = Symbol('COMPARE_ENTRY_TO_RESULTS')
export const DEFER = Symbol('DEFER')
export const HAS_BEEN_DEFERRED = Symbol('HAS_BEEN_DEFERRED')
export const FIRST_ISSUE_FOR_ENTRY = Symbol('FIRST_ISSUE_FOR_ENTRY')
export const TRY_PARSE_ISSUE_DETAILS = Symbol('TRY_PARSE_ISSUE_DETAILS')

export type SearchEffect = Effect<typeof SEARCH, string, ComicVineSearchResult[]>
export function* search(query: string): EffectGenerator<SearchEffect> {
  return yield { type: SEARCH, payload: query }
}

export type VolumeEffect = Effect<typeof VOLUME, number, ComicVineVolume>
export function* volume(id: number): EffectGenerator<VolumeEffect> {
  return yield { type: VOLUME, payload: id }
}

export type IssueEffect = Effect<typeof ISSUE, number, LibraryIssue>
export function* issue(id: number): EffectGenerator<IssueEffect> {
  return yield { type: ISSUE, payload: id }
}

export type CompareEntryToResultsEffect<T> = Effect<
  typeof COMPARE_ENTRY_TO_RESULTS,
  { entry: LibraryEntry, results: T[] },
  ComicVineMatchResult<T>
>
export function* compareEntryToResults<T>(entry: LibraryEntry, results: T[])
  : EffectGenerator<CompareEntryToResultsEffect<T>> {
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

export type FirstIssueForEntryEffect = Effect<typeof FIRST_ISSUE_FOR_ENTRY, LibraryEntry, LibraryIssue | null>
export function* firstIssueForEntry(entry: LibraryEntry): EffectGenerator<FirstIssueForEntryEffect> {
  return yield { type: FIRST_ISSUE_FOR_ENTRY, payload: entry }
}

export type TryParseIssueDetailsEffect = Effect<typeof TRY_PARSE_ISSUE_DETAILS, LibraryEntry, ParsedIssue>
export function* tryParseIssueDetails(entry: LibraryEntry): EffectGenerator<TryParseIssueDetailsEffect> {
  return yield { type: TRY_PARSE_ISSUE_DETAILS, payload: entry }
}
