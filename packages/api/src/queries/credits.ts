import { QueryResolvers, LibraryCreditCharacter as ApiCreditCharacter, LibraryCreditConcept as ApiCreditConcept, LibraryCreditLocation as ApiCreditLocation, LibraryCreditObject as ApiCreditObject, LibraryCreditPerson as ApiCreditPerson, LibraryCreditStoryArc as ApiCreditStoryArc, LibraryCreditTeam as ApiCreditTeam } from '../types/schema'
import { GraphqlContext } from '../types'

type RCharacter = QueryResolvers<GraphqlContext>['characterCredits']
type RConcept = QueryResolvers<GraphqlContext>['conceptCredits']
type RLocation = QueryResolvers<GraphqlContext>['locationCredits']
type RObject = QueryResolvers<GraphqlContext>['objectCredits']
type RPerson = QueryResolvers<GraphqlContext>['personCredits']
type RStoryArc = QueryResolvers<GraphqlContext>['storyArcCredits']
type RTeam = QueryResolvers<GraphqlContext>['teamCredits']

export const characterCredits: RCharacter = async (_, { input }, { library }) => {
  return await library.config.getCharacters(input.collection) as ApiCreditCharacter[]
}

export const conceptCredits: RConcept = async (_, { input }, { library }) => {
  return await library.config.getConcepts(input.collection) as ApiCreditConcept[]
}

export const locationCredits: RLocation = async (_, { input }, { library }) => {
  return await library.config.getLocations(input.collection) as ApiCreditLocation[]
}

export const objectCredits: RObject = async (_, { input }, { library }) => {
  return await library.config.getObjects(input.collection) as ApiCreditObject[]
}

export const personCredits: RPerson = async (_, { input }, { library }) => {
  return await library.config.getPeople(input.collection) as ApiCreditPerson[]
}

export const storyArcCredits: RStoryArc = async (_, { input }, { library }) => {
  return await library.config.getStoryArcs(input.collection) as ApiCreditStoryArc[]
}

export const teamCredits: RTeam = async (_, { input }, { library }) => {
  return await library.config.getTeams(input.collection) as ApiCreditTeam[]
}
