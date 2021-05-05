import { ComicVineIssueResponseData, ComicVineVolumeResponseData } from "src/gateways/ComicVineGateway";

export type ComicVineSearchResult =
  | ComicVineIssueSearchResult
  | ComicVineVolumeSearchResult

export interface ComicVineVolume {
  comicVineApiResponse: ComicVineVolumeResponseData
  issues: {
    name: string
    number: number
    comicVineId: number
    comicVineApiUrl: string
  }[]
}

export interface ComicVineIssue {
  comicVineApiResponse: ComicVineIssueResponseData
  coverDate: Date
  comicVineId: number
  issueNumber: number
  imageUrl?: string
  name?: string
  characters: ComicVineCharacter[]
  concepts: ComicVineConcept[]
  locations: ComicVineLocation[]
  objects: ComicVineObject[]
  people: ComicVinePerson[]
  storyArcs: ComicVineStoryArc[]
  teams: ComicVineTeam[]
}

interface ComicVineResource {
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

export interface ComicVineCharacter extends ComicVineResource {
  type: 'character'
}

export interface ComicVineConcept extends ComicVineResource {
  type: 'concept'
}

export interface ComicVineLocation extends ComicVineResource {
  type: 'location'
}

export interface ComicVineObject extends ComicVineResource {
  type: 'object'
}

export interface ComicVinePerson extends ComicVineResource {
  type: 'person'
  roles: string[]
}

export interface ComicVineStoryArc extends ComicVineResource {
  type: 'storyArc'
}

export interface ComicVineTeam extends ComicVineResource {
  type: 'team'
}
