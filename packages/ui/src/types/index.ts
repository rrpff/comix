import { ApolloError } from '@apollo/client'
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
