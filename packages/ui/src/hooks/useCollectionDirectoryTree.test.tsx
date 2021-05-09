import path from 'path'
import { renderHook } from '@testing-library/react-hooks'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { useCollectionDirectoryTree, QUERY } from './useCollectionDirectoryTree'
import { generateCollection } from '../../test/generators'
import { LibraryCollection } from '../../types/apiSchema'

it.each([null, undefined])('returns an empty state if given null args', (collection) => {
  const { render } = subject()
  const { result } = render(collection)

  expect(result.current.error).toBeUndefined()
  expect(result.current).toMatchObject({ tree: undefined, loading: false, error: undefined })
})

it('returns loading initially', () => {
  const { render } = subject()
  const collection = generateCollection()

  const { result } = render(collection)

  const expectedTree = {
    name: collection.name,
    path: collection.path,
    directories: [],
  }

  expect(result.current.error).toBeUndefined()
  expect(result.current).toEqual({ tree: expectedTree, loading: true, error: undefined })
})

it('returns all directories in the collection', async () => {
  const { mocks, render } = subject()
  const collection = generateCollection()
  const collectionDirectories = [
    { directory: ['Root'] },
    { directory: ['Nested', 'Example'] },
  ]

  mocks.push({
    result: { data: { collectionDirectories } },
    request: { query: QUERY, variables: { input: { path: collection.path } } },
  })

  const { result, waitForNextUpdate } = render(collection)
  await waitForNextUpdate()

  const expectedTree = {
    name: collection.name,
    path: collection.path,
    directories: [{
      name: 'Nested',
      path: path.join(collection.path, 'Nested'),
      directories: [
        { name: 'Example', path: path.join(collection.path, 'Nested', 'Example'), directories: [] }
      ]
    }, {
      name: 'Root',
      path: path.join(collection.path, 'Root'),
      directories: [],
    }],
  }

  expect(result.current.error).toBeUndefined()
  expect(result.current.tree).toEqual(expectedTree)
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
    render: (collection?: LibraryCollection | null) => {
      return renderHook(
        () => useCollectionDirectoryTree(collection),
        { wrapper: wrapper }
      )
    }
  }
}
