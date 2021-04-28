import { renderHook } from '@testing-library/react-hooks'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import faker from 'faker'
import { useCollectionDirectory, QUERY } from './useCollectionDirectory'
import { generateCollection, generateEntry, list } from '../../test/generators'

it('returns an empty state if given null args', () => {
  const { render } = subject()
  const { result } = render(null, null)

  expect(result.current).toMatchObject({ entries: [], loading: false, error: undefined })
})

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render('/abc', '/abc/123')

  expect(result.current).toEqual({ entries: [], loading: true, error: undefined })
})

it('returns all entries in the collection directory', async () => {
  const { mocks, render } = subject()
  const entries = list(generateEntry)

  const collection = generateCollection().path
  const directoryPath = collection + faker.system.filePath()

  mocks.push({
    result: { data: { entries } },
    request: { query: QUERY, variables: { input: { collection, directoryPath } } },
  })

  const { result, waitForNextUpdate } = render(collection, directoryPath)
  await waitForNextUpdate()

  expect(result.current.entries).toEqual(entries)
  expect(result.current.loading).toEqual(false)
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
    render: (collection?: string | null, directory?: string | null) => {
      return renderHook(
        () => useCollectionDirectory(collection, directory),
        { wrapper: wrapper }
      )
    }
  }
}
