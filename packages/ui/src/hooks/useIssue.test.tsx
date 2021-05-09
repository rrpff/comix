import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react-hooks'
import { generateCollection, generateEntry, generateIssue, list } from '../../test/generators'
import { LibraryIdentifier } from '../types'
import { QUERY, useIssue } from './useIssue'

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render({ source: 'whatever', sourceId: '123' })

  expect(result.current.loading).toEqual(true)
})

it('returns the issue with its volume and entries', async () => {
  const { mocks, render } = subject()
  const collection = generateCollection()
  const issue = generateIssue({
    entries: list(() => {
      return {
        collection: { path: collection.path },
        entry: generateEntry(),
      }
    })
  })

  const identifier = { source: issue.source, sourceId: issue.sourceId }

  mocks.push({
    result: { data: { issue } },
    request: { query: QUERY, variables: { input: identifier } },
  })

  const { result, waitForNextUpdate } = render(identifier)
  await waitForNextUpdate()

  delete issue.volume?.issues
  expect(result.current.issue).toMatchObject(issue)
})

const subject = () => {
  const mocks = [] as MockedResponse[]
  const wrapper: React.FC = ({ children }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  )

  return {
    mocks,
    render: (identifier: LibraryIdentifier) => {
      return renderHook(() => useIssue(identifier), { wrapper })
    }
  }
}
