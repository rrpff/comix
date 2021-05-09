import { LibraryCreditCharacter, LibraryCreditConcept, LibraryCreditLocation, LibraryCreditObject, LibraryCreditStoryArc, LibraryCreditTeam } from './apiSchema'

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
