import { LibraryCreditBase } from '@comix/library'
import { QueryResolvers, LibraryCreditCharacter as ApiCreditCharacter, LibraryCreditConcept as ApiCreditConcept, LibraryCreditLocation as ApiCreditLocation, LibraryCreditObject as ApiCreditObject, LibraryCreditPerson as ApiCreditPerson, LibraryCreditStoryArc as ApiCreditStoryArc, LibraryCreditTeam as ApiCreditTeam } from '../types/schema'
import { GraphqlContext } from '../types'

type RCharacter = QueryResolvers<GraphqlContext>['characterCredit']
type RConcept = QueryResolvers<GraphqlContext>['conceptCredit']
type RLocation = QueryResolvers<GraphqlContext>['locationCredit']
type RObject = QueryResolvers<GraphqlContext>['objectCredit']
type RPerson = QueryResolvers<GraphqlContext>['personCredit']
type RStoryArc = QueryResolvers<GraphqlContext>['storyArcCredit']
type RTeam = QueryResolvers<GraphqlContext>['teamCredit']

export const characterCredit: RCharacter = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditCharacter
}

export const conceptCredit: RConcept = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditConcept
}

export const locationCredit: RLocation = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditLocation
}

export const objectCredit: RObject = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditObject
}

export const personCredit: RPerson = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditPerson
}

export const storyArcCredit: RStoryArc = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditStoryArc
}

export const teamCredit: RTeam = async (_, { input }, { library }) => {
  return mapCredit(await library.config.getCredit(input)) as ApiCreditTeam
}

const mapCredit = (result: LibraryCreditBase) => {
  return {
    ...result,
    issues: result.issues?.map(issue => ({
      source: issue.source,
      sourceId: issue.sourceId,
      volume: issue.volume,
      coverDate: issue.coverDate,
      issueNumber: issue.issueNumber,
      name: issue.name,
      entries: issue.entries?.map(entry => ({
        collection: { path: entry.collectionPath },
        entry: entry.entry
      })),
    }))
  }
}
