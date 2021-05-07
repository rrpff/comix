import axios, { AxiosInstance } from 'axios'
import { LibraryIssue } from '@comix/library'
import {
  ComicVineSearchResult,
  ComicVineVolumeSearchResult,
  ComicVineIssueSearchResult,
  ComicVineVolume
} from '../types'

const SOURCE_NAME = 'COMIC_VINE'

export class ComicVineGateway {
  private http: AxiosInstance

  constructor(host: string, apiKey: string) {
    this.http = axios.create({
      baseURL: host,
      params: {
        api_key: apiKey,
        format: 'json',
      },
    })
  }

  public async search(query: string): Promise<ComicVineSearchResult[]> {
    if (query === '') return []

    const res = await this.http.get<ComicVineSearchResponseData>('/search/', {
      params: {
        query: query,
        resources: 'volume,issue',
        limit: 20,
      }
    })

    return mapSearchResponse(res.data)
  }

  public async volume(id: number): Promise<ComicVineVolume> {
    const res = await this.http.get<ComicVineVolumeResponseData>(`/volume/4050-${id}`)
    return mapVolumeResponse(res.data)
  }

  public async issue(id: number): Promise<LibraryIssue> {
    const res = await this.http.get<ComicVineIssueResponseData>(`/issue/4000-${id}`)
    return mapIssueResponse(res.data)
  }
}

const mapSearchResponse = (data: ComicVineSearchResponseData): ComicVineSearchResult[] => {
  return data.results
    .filter(result => ['volume', 'issue'].includes(result.resource_type))
    .map(result => result.resource_type === 'volume'
      ? mapSearchVolumeToResult(result)
      : mapSearchIssueToResult(result))
}

const mapVolumeResponse = (data: ComicVineVolumeResponseData): ComicVineVolume => ({
  comicVineApiResponse: data,
  comicVineId: data.results.id,
  issues: data.results.issues.map(issue => ({
    name: issue.name,
    number: Number(issue.issue_number),
    comicVineId: issue.id,
    comicVineApiUrl: issue.api_detail_url,
  }))
})

const mapIssueResponse = (data: ComicVineIssueResponseData): LibraryIssue => ({
  source: SOURCE_NAME,
  sourceId: data.results.id.toString(),
  coverDate: new Date(data.results.cover_date),
  volume: {
    source: SOURCE_NAME,
    sourceId: data.results.volume.id.toString(),
    sourceMetadata: { apiUrl: data.results.volume.api_detail_url },
    name: data.results.volume.name,
  },
  issueNumber: Number(data.results.issue_number),
  name: data.results.name,
  imageUrl: data.results.image?.medium_url,
  characters: data.results.character_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'character',
    name: c.name,
  })),
  concepts: data.results.concept_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'concept',
    name: c.name,
  })),
  locations: data.results.location_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'location',
    name: c.name,
  })),
  objects: data.results.object_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'object',
    name: c.name,
  })),
  people: data.results.person_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'person',
    name: c.name,
    roles: c.role.split(',').map(r => r.trim()),
  })),
  storyArcs: data.results.story_arc_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'storyArc',
    name: c.name,
  })),
  teams: data.results.team_credits.map(c => ({
    source: SOURCE_NAME,
    sourceId: c.id.toString(),
    sourceMetadata: { apiUrl: c.api_detail_url },
    type: 'team',
    name: c.name,
  })),
})

const mapSearchVolumeToResult = (volume: ComicVineSearchResponseVolume): ComicVineVolumeSearchResult => ({
  name: volume.name,
  comicVineId: volume.id,
  comicVineApiUrl: volume.api_detail_url,
  imageUrl: volume.image?.medium_url,
  type: 'volume',
  startYear: Number(volume.start_year),
  numberOfIssues: volume.count_of_issues,
  publisher: volume.publisher ? {
    name: volume.publisher.name,
    comicVineId: volume.publisher.id,
    comicVineApiUrl: volume.api_detail_url,
  } : undefined,
  firstIssue: volume.first_issue ? {
    name: volume.first_issue.name,
    comicVineId: volume.first_issue.id,
    comicVineApiUrl: volume.first_issue.api_detail_url,
    issueNumber: Number(volume.first_issue.issue_number),
  } : undefined,
  lastIssue: volume.last_issue ? {
    name: volume.last_issue.name,
    comicVineId: volume.last_issue.id,
    comicVineApiUrl: volume.last_issue.api_detail_url,
    issueNumber: Number(volume.last_issue.issue_number),
  } : undefined,
})

const mapSearchIssueToResult = (issue: ComicVineSearchResponseIssue): ComicVineIssueSearchResult => ({
  name: issue.name,
  comicVineId: issue.id,
  comicVineApiUrl: issue.api_detail_url,
  imageUrl: issue.image?.medium_url,
  type: 'issue',
  coverDate: new Date(issue.cover_date),
  issueNumber: Number(issue.issue_number),
  volume: issue.volume ? {
    name: issue.volume.name,
    comicVineId: issue.volume.id,
    comicVineApiUrl: issue.volume.api_detail_url,
  } : undefined,
})

interface ComicVineSearchResponseVolume {
  api_detail_url: string
  count_of_issues: number
  id: number
  name: string
  start_year: string
  resource_type: 'volume'
  image?: {
    medium_url: string
  }
  publisher?: {
    api_detail_url: string
    id: number
    name: string
  }
  first_issue?: {
    api_detail_url: string
    id: number
    name: string
    issue_number: string
  }
  last_issue?: {
    api_detail_url: string
    id: number
    name: string
    issue_number: string
  }
}

interface ComicVineSearchResponseIssue {
  api_detail_url: string
  cover_date: string
  id: number
  issue_number: string
  name: string
  resource_type: 'issue'
  image?: {
    medium_url: string
  }
  volume?: {
    api_detail_url: string
    id: number
    name: string
  }
}

interface ComicVineSearchResponseData {
  results: (ComicVineSearchResponseVolume | ComicVineSearchResponseIssue)[]
}

export interface ComicVineVolumeResponseData {
  results: {
    description: string
    id: number
    issues: {
      name: string
      issue_number: string
      id: number
      api_detail_url: string
    }[]
  }
}

export interface ComicVineIssueResponseData {
  results: {
    api_detail_url: string
    cover_date: string
    description: string
    id: number
    issue_number: string
    name?: string

    image?: {
      medium_url: string
    }

    volume: {
      id: number
      name: string
      api_detail_url: string
    }

    character_credits: {
      api_detail_url: string
      id: number
      name: string
    }[]

    concept_credits: {
      api_detail_url: string
      id: number
      name: string
    }[]

    location_credits: {
      api_detail_url: string
      id: number
      name: string
    }[]

    object_credits: {
      api_detail_url: string
      id: number
      name: string
    }[]

    person_credits: {
      api_detail_url: string
      id: number
      name: string
      role: string
    }[]

    story_arc_credits: {
      api_detail_url: string
      id: number
      name: string
    }[]

    team_credits: {
      api_detail_url: string
      id: number
      name: string
    }[]
  }
}
