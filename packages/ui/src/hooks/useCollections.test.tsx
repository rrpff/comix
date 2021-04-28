import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react-hooks'
import { generateCollection, list } from '../../test/generators'
import { useCollections, QUERY } from './useCollections'

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render()

  expect(result.current.loading).toEqual(true)
})

it('returns all collections', async () => {
  const { mocks, render } = subject()
  const collections = list(generateCollection)

  mocks.push({
    request: { query: QUERY, variables: {} },
    result: { data: { collections } },
  })

  const { result, waitForNextUpdate } = render()
  await waitForNextUpdate()

  expect(result.current.collections).toEqual(collections)
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
    render: () => {
      return renderHook(() => useCollections(), { wrapper: wrapper })
    }
  }
}
