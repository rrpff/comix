import nock from 'nock'
import faker from 'faker'
import { ComicVineGateway } from './ComicVineGateway'
import * as comicVineStubs from '../../test/comicVineHttpResponses'

test('search returns no results when omitting a query', async () => {
  const { search } = subject()
  const results = await search('')

  expect(results).toEqual([])
})

test('search makes valid search requests', async () => {
  const { search, stubSearchEndpointForQuery } = subject()
  const query = faker.lorem.sentence()
  const scope = stubSearchEndpointForQuery(query, comicVineStubs.searchAnimalManResponse)

  await search(query)

  scope.done()
})

test.each([
  { query: 'Animal Man', stub: comicVineStubs.searchAnimalManResponse },
  { query: 'Superman', stub: comicVineStubs.searchSupermanResponse }
])('search returns formatted search results', async ({ query, stub }) => {
  const { search, stubSearchEndpointForQuery } = subject()

  stubSearchEndpointForQuery(query, stub)
  const results = await search(query)

  expect(results).toMatchSnapshot(`${query} Search Results`)
})

test('volume makes valid volume requests', async () => {
  const { volume, stubVolumeEndpointForId } = subject()
  const id = Math.floor(Math.random() * 1000)
  const scope = stubVolumeEndpointForId(id, comicVineStubs.animalManVolumeResponse)

  await volume(id)

  scope.done()
})

test.each([
  { id: 3976, stub: comicVineStubs.animalManVolumeResponse },
  { id: 773, stub: comicVineStubs.supermanVolumeResponse }
])('volume includes issues in that volume', async ({ id, stub }) => {
  const { volume, stubVolumeEndpointForId } = subject()
  stubVolumeEndpointForId(id, stub)

  const result = await volume(id)

  expect(result.issues).toMatchSnapshot(`${id} Volume Issues`)
})

test.each([
  { id: 3976, stub: comicVineStubs.animalManVolumeResponse },
  { id: 773, stub: comicVineStubs.supermanVolumeResponse },
])('volume includes the original api response', async ({ id, stub }) => {
  const { volume, stubVolumeEndpointForId } = subject()
  stubVolumeEndpointForId(id, stub)

  const result = await volume(id)

  expect(result.comicVineApiResponse).toEqual(stub.body)
})

test('issue makes valid issue requests', async () => {
  const { issue, stubIssueEndpointForId } = subject()
  const id = Math.floor(Math.random() * 1000)
  const scope = stubIssueEndpointForId(id, comicVineStubs.animalManIssueResponse)

  await issue(id)

  scope.done()
})

test.each([
  { id: 30000, stub: comicVineStubs.animalManIssueResponse },
  { id: 110227, stub: comicVineStubs.supermanIssueResponse },
])('issue includes basic information', async ({ id, stub }) => {
  const { issue, stubIssueEndpointForId } = subject()

  stubIssueEndpointForId(id, stub)

  const result = await issue(id)
  const basic = {
    coverDate: result.coverDate,
    id: result.comicVineId,
    issueNumber: result.issueNumber,
    imageUrl: result.imageUrl,
    name: result.name,
  }

  expect(basic).toMatchSnapshot(`${id} Issue`)
})

test.each([
  { id: 30000, stub: comicVineStubs.animalManIssueResponse },
  { id: 110227, stub: comicVineStubs.supermanIssueResponse }
])('issue includes sub resources', async ({ id, stub }) => {
  const { issue, stubIssueEndpointForId } = subject()

  stubIssueEndpointForId(id, stub)
  const result = await issue(id)

  expect(result.characters).toMatchSnapshot(`${id} Issue Characters`)
  expect(result.concepts).toMatchSnapshot(`${id} Issue Concepts`)
  expect(result.locations).toMatchSnapshot(`${id} Issue Locations`)
  expect(result.objects).toMatchSnapshot(`${id} Issue Objects`)
  expect(result.people).toMatchSnapshot(`${id} Issue People`)
  expect(result.storyArcs).toMatchSnapshot(`${id} Issue Story arcs`)
  expect(result.teams).toMatchSnapshot(`${id} Issue Teams`)
})

test.each([
  { id: 30000, stub: comicVineStubs.animalManIssueResponse },
  { id: 110227, stub: comicVineStubs.supermanIssueResponse },
])('issue includes the original api response', async ({ id, stub }) => {
  const { issue, stubIssueEndpointForId } = subject()
  stubIssueEndpointForId(id, stub)

  const result = await issue(id)

  expect(result.comicVineApiResponse).toEqual(stub.body)
})

const subject = () => {
  const host = 'https://example.com'
  const apiKey = faker.datatype.uuid()
  const instance = new ComicVineGateway(host, apiKey)

  const stubSearchEndpointForQuery = (query: string, response: { status: number, body: object }) => {
    return nock(host)
      .get('/search/')
      .query({
        query: query,
        api_key: apiKey,
        format: 'json',
        resources: 'volume,issue',
        limit: 20,
      })
      .reply(response.status, response.body)
  }

  const stubVolumeEndpointForId = (id: number, response: { status: number, body: object }) => {
    return nock(host)
      .get(`/volume/4050-${id}`)
      .query({ api_key: apiKey, format: 'json' })
      .reply(response.status, response.body)
  }

  const stubIssueEndpointForId = (id: number, response: { status: number, body: object }) => {
    return nock(host)
      .get(`/issue/4000-${id}`)
      .query({ api_key: apiKey, format: 'json' })
      .reply(response.status, response.body)
  }

  return {
    instance,
    host,
    apiKey,
    search: instance.search.bind(instance),
    issue: instance.issue.bind(instance),
    volume: instance.volume.bind(instance),
    stubSearchEndpointForQuery,
    stubVolumeEndpointForId,
    stubIssueEndpointForId,
  }
}
