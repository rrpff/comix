import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react-hooks'
import { generateCollection, generateCredit, generateEntry, generateIssue, generatePersonCredit, generateVolume, list } from '../../test/generators'
import { CreditType } from '../../types'
import { LibraryIssue } from '../../types/apiSchema'
import { LibraryIdentifier } from '../types'
import { queryFor, useCredit } from './useCredit'

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render({ source: 'whatever', sourceId: '123' }, 'character')

  expect(result.current.loading).toEqual(true)
})

it.each([
  { type: 'character' },
  { type: 'concept' },
  { type: 'location' },
  { type: 'object' },
  { type: 'person' },
  { type: 'storyArc' },
  { type: 'team' },
])('returns the credit with its issues', async ({ type }) => {
  const { mocks, render } = subject()

  const collection = generateCollection()
  const credit = generateCredit({
    type: type,
    issues: list(() => generateIssue({
      entries: list(() => {
        return {
          collection: { path: collection.path },
          entry: generateEntry(),
        }
      })
    }))
  })

  const identifier = { source: credit.source, sourceId: credit.sourceId }
  const key = `${type}Credit`

  mocks.push({
    result: { data: { [key]: credit } },
    request: { query: queryFor(type as CreditType), variables: { input: identifier } },
  })

  const { result, waitForNextUpdate } = render(identifier, type as CreditType)
  await waitForNextUpdate()

  credit.issues!.forEach((issue: LibraryIssue) => delete issue.volume?.issues)
  expect(result.current.credit).toMatchObject(credit)
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
    render: (identifier: LibraryIdentifier, type: CreditType) => {
      return renderHook(() => useCredit(identifier, type), { wrapper })
    }
  }
}
