import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react-hooks'
import { generateCollection, generateCredit, generatePersonCredit, generateVolume, list } from '../../test/generators'
import { CreditType } from '../types'
import { queryFor, useCredits } from './useCredits'

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render('/whatever', 'character')

  expect(result.current.error).toBeUndefined()
  expect(result.current.loading).toEqual(true)
})

it.each([
  { type: 'character', generate: () => generateCredit({ type: 'character' }) },
  { type: 'concept', generate: () => generateCredit({ type: 'concept' }) },
  { type: 'location', generate: () => generateCredit({ type: 'location' }) },
  { type: 'object', generate: () => generateCredit({ type: 'object' }) },
  { type: 'person', generate: () => generatePersonCredit() },
  { type: 'storyArc', generate: () => generateCredit({ type: 'storyArc' }) },
  { type: 'team', generate: () => generateCredit({ type: 'team' }) },
])('returns all credits for the given type', async ({ type, generate }) => {
  const { mocks, render } = subject()

  const collection = generateCollection().path
  const credits = list(generate)
  const key = `${type}Credits`

  mocks.push({
    request: { query: queryFor(type as CreditType), variables: { input: { collection } } },
    result: { data: { [key]: credits } },
  })

  const { result, waitForNextUpdate } = render(collection, type as CreditType)
  await waitForNextUpdate()

  expect(result.current.error).toBeUndefined()
  expect(result.current.credits).toEqual(credits)
})

const subject = () => {
  const mocks = [] as MockedResponse[]
  const wrapper: React.FC = ({ children }) => (
    <MockedProvider mocks={mocks}>
      {children}
    </MockedProvider>
  )

  return {
    mocks,
    render: (collection: string, type: CreditType) => {
      return renderHook(() => useCredits(collection, type), { wrapper })
    }
  }
}
