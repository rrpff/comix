import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Directory, LibraryCollection } from '@comix/ui'
import { UseCollectionsHook } from '@comix/ui/hooks/useCollections'
import { UseCollectionDirectoryTreeHook } from '@comix/ui/hooks/useCollectionDirectoryTree'
import { DependencyProvider, DependencyMap } from 'react-use-dependency'
import { SidebarView } from './Sidebar'
import { list, generateCollection, pick, generateDirectory } from '../../test/generators'

it('displays all collections', async () => {
  const { render, stubCollections, stubCollectionDirectories, waitForCollections } = await subject()
  const collections = list(generateCollection)

  stubCollections(collections)
  stubCollectionDirectories(undefined, [])
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
  const directories = list(generateDirectory)

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
  const { render, stubCollections, stubCollectionDirectories, waitForCollections } = await subject()
  const collections = list(generateCollection)

  stubCollections(collections)
  stubCollectionDirectories(undefined, [])
  render()

  await waitForCollections()

  expect.assertions(collections.length)
  await Promise.all(collections.map(async collection => {
    const elem = screen.getByTestId(`${collection.path}-root`)
    expect(elem).toHaveTextContent('(root)')
  }))
})

const subject = async () => {
  const dependencies: DependencyMap = {}

  const stubCollections = (collections: LibraryCollection[]) => {
    const stubUseCollections: UseCollectionsHook = () => {
      return { collections, loading: false }
    }

    dependencies['useCollections'] = stubUseCollections
  }

  const stubCollectionDirectories = (collection?: LibraryCollection, directories?: Directory[]) => {
    const stubUseCollectionDirectoryTree: UseCollectionDirectoryTreeHook = (inner?: LibraryCollection) => {
      const tree = collection === inner
        ? { name: collection?.name, path: collection?.path, directories }
        : { name: null, path: null, directories: [] }

      return { tree, loading: false }
    }

    dependencies['useCollectionDirectoryTree'] = stubUseCollectionDirectoryTree
  }

  const waitForCollections = () => waitFor(() => screen.getByTestId('collections'))
  const waitForDirectory = (path: string) => waitFor(() => screen.getByTestId(`${path}-directory`))

  return {
    stubCollections,
    stubCollectionDirectories,
    waitForCollections,
    waitForDirectory,
    render: () => {
      return render(
        <DependencyProvider value={dependencies}>
          <MemoryRouter>
            <SidebarView />
          </MemoryRouter>
        </DependencyProvider>
      )
    }
  }
}
