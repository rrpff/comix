import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { LibraryCollection } from '@comix/ui'
import path from 'path'
import faker from 'faker'
import { list, generateCollection, pick } from '../../test/generators'
import { SidebarView, COLLECTIONS_QUERY, COLLECTION_DIRECTORY_QUERY } from './Sidebar'

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
  const { render, stubCollections, stubCollectionDirectories, waitForCollections, waitForDirectory } = await subject()
  const collections = list(generateCollection)
  const desiredCollection = pick(collections)
  const directories = list(() => {
    const dirpath = path.join(desiredCollection.path, faker.system.fileName())
    const paths = path.relative(desiredCollection.path, dirpath).split(path.sep)

    return { name: path.basename(dirpath), path: dirpath, paths }
  })

  stubCollections(collections)
  stubCollectionDirectories(desiredCollection, directories)
  render()

  await waitForCollections()
  await waitForDirectory(desiredCollection.path)

  expect.assertions(directories.length)
  directories.forEach(directory => {
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

  const stubCollectionDirectories = (collection: LibraryCollection, directories: { paths: string[] }[]) => {
    mocks.push({
      request: { query: COLLECTION_DIRECTORY_QUERY, variables: { input: { path: collection.path } } },
      result: { data: { collectionDirectories: directories.map(d => ({ directory: d.paths })) } }
    })
  }

  const waitForCollections = () => waitFor(() => screen.getByTestId('collections'))
  const waitForDirectory = (path: string) => waitFor(() => screen.getByTestId(`${path}-directory`))

  return {
    mocks,
    stubCollections,
    stubCollectionDirectories,
    waitForCollections,
    waitForDirectory,
    render: () => {
      return render(
        <MockedProvider mocks={mocks}>
          <MemoryRouter>
            <SidebarView />
          </MemoryRouter>
        </MockedProvider>
      )
    }
  }
}
