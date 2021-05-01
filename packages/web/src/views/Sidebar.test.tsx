import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { list, generateCollection, pick, generateDirectory } from '../../test/generators'
import { SidebarView, COLLECTIONS_QUERY, DIRECTORY_QUERY } from './Sidebar'
import { Directory, LibraryCollection } from '@comix/ui'

it('displays all collections', async () => {
  const { render, stubCollections, waitForCollections } = await subject()
  const collections = list(generateCollection)

  stubCollections(collections)
  render()

  await waitForCollections()

  expect.assertions(collections.length)
  collections.forEach(collection => {
    const elem = screen.getByTestId(collection.path)
    expect(elem).toHaveTextContent(collection.name)
  })
})

it('displays directories in the root of each collection', async () => {
  const { render, stubCollections, stubDirectory, waitForCollections, waitForDirectory } = await subject()
  const collections = list(generateCollection)
  const desiredCollection = pick(collections)
  const desiredDirectory = generateDirectory()

  stubCollections(collections)
  stubDirectory(desiredCollection, desiredDirectory)
  render()

  await waitForCollections()
  await waitForDirectory(desiredCollection.path)

  expect.assertions(desiredDirectory.directories!.length)
  desiredDirectory.directories!.forEach(directory => {
    const elem = screen.getByTestId(directory.path)
    expect(elem).toHaveTextContent(directory.name)
  })
})

it('includes a root directory for each collection', async () => {
  const { render, stubCollections, waitForCollections } = await subject()
  const collections = list(generateCollection)

  stubCollections(collections)
  render()

  await waitForCollections()

  expect.assertions(collections.length)
  await Promise.all(collections.map(async collection => {
    const elem = screen.getByTestId(`${collection.path}-root`)
    expect(elem).toHaveTextContent('(root)')
  }))
})

const subject = async () => {
  const mocks = [] as MockedResponse[]

  const stubCollections = (collections: LibraryCollection[]) => {
    mocks.push({
      request: { query: COLLECTIONS_QUERY },
      result: { data: { collections } },
    })
  }

  const stubDirectory = (collection: LibraryCollection, directory: Directory) => {
    mocks.push({
      request: { query: DIRECTORY_QUERY, variables: { input: { path: collection.path } } },
      result: { data: { directory } }
    })
  }

  const waitForCollections = () => waitFor(() => screen.getByTestId('collections'))
  const waitForDirectory = (path: string) => waitFor(() => screen.getByTestId(`${path}-directory`))

  return {
    mocks,
    stubCollections,
    stubDirectory,
    waitForCollections,
    waitForDirectory,
    render: () => {
      return render(
        <MockedProvider mocks={mocks}>
          <SidebarView />
        </MockedProvider>
      )
    }
  }
}
