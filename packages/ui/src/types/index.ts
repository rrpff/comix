import { ApolloError } from '@apollo/client'
import { Comic, Reader } from '@comix/parser'
import { Directory, LibraryCollection, LibraryCreditCharacter, LibraryCreditConcept, LibraryCreditLocation, LibraryCreditObject, LibraryCreditStoryArc, LibraryCreditTeam, LibraryIssue, LibraryVolume } from './apiSchema'

export interface LibraryIdentifier {
  source: string
  sourceId: string
}

export type LibraryCredit =
  | LibraryCreditCharacter
  | LibraryCreditConcept
  | LibraryCreditLocation
  | LibraryCreditObject
  | LibraryCreditStoryArc
  | LibraryCreditTeam

export type UseDelayedLoadingHook = (loading?: boolean, delay?: number) => boolean

export type UseCollectionsHook = () => {
  collections: LibraryCollection[]
  loading: boolean
  error?: ApolloError
}

export type UseCollectionDirectoryTreeHook = (collection?: LibraryCollection | null) => {
  tree?: Directory
  loading: boolean
  error?: ApolloError
}

export type UseIssueHook = (identifier: LibraryIdentifier) => {
  issue?: LibraryIssue
  loading: boolean
  error?: ApolloError
}

export type UseVolumeHook = (identifier: LibraryIdentifier) => {
  volume?: LibraryVolume
  loading: boolean
  error?: ApolloError
}

export type UseVolumesHook = (collectionPath: string) => {
  volumes?: LibraryVolume[]
  loading: boolean
  error?: ApolloError
}

export type CreditType =
  | 'character'
  | 'concept'
  | 'location'
  | 'object'
  | 'person'
  | 'storyArc'
  | 'team'

export type UseCreditsHook = <T extends LibraryCredit>(collectionPath: string, type: CreditType) => {
  credits?: T[]
  loading: boolean
  error?: ApolloError
}

export type UseCreditHook = <T extends LibraryCredit>(identifier: LibraryIdentifier, type: CreditType) => {
  credit?: T
  loading: boolean
  error?: ApolloError
}

export interface ComicPageWithUrl {
  index: number
  name: string
  type: string
  url: string
}

export type UseComicReaderHook = (file?: File, startingPage?: number) => Reader | null

export type UseComicHook = (reader: Reader | null) => {
  loading: boolean
  comic?: Comic
  name?: string
  currentPages: ComicPageWithUrl[]
  preloadedPages: ComicPageWithUrl[]
  next: () => void
  previous: () => void
  goto: (pageNumber: number) => void
}
