import { LibraryIssue } from '@comix/library'
import { ComicVineVolumeResponseData } from '../gateways/ComicVineGateway'

export interface ComicVineMatch<T> {
  comparison: T
  score: number
}

export type ComicVineMatchable = LibraryIssue | ComicVineSearchResult

export interface ComicVineMatchResult<T> {
  strongest?: ComicVineMatch<T>
  matches: ComicVineMatch<T>[]
}

export type ComicVineSearchResult =
  | ComicVineIssueSearchResult
  | ComicVineVolumeSearchResult

export interface ComicVineVolume {
  comicVineApiResponse: ComicVineVolumeResponseData
  comicVineId: number
  issues: {
    name: string
    number: number
    comicVineId: number
    comicVineApiUrl: string
  }[]
}

export interface ComicVineResource {
  name?: string
  comicVineId: number
  comicVineApiUrl: string
}

interface ComicVineBaseSearchResult {
  name?: string
  comicVineId: number
  comicVineApiUrl: string
  imageUrl?: string
}

export interface ComicVineVolumeSearchResult extends ComicVineBaseSearchResult {
  type: 'volume'
  startYear: number
  numberOfIssues: number
  publisher?: ComicVineResource
  firstIssue?: ComicVineResource & {
    issueNumber: number
  }
  lastIssue?: ComicVineResource & {
    issueNumber: number
  }
}

export interface ComicVineIssueSearchResult extends ComicVineBaseSearchResult {
  type: 'issue'
  coverDate: Date
  issueNumber: number
  volume?: ComicVineResource
}
