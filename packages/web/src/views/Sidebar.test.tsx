import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Directory, LibraryCollection } from '@comix/ui'
import { UseCollectionsHook } from '@comix/ui/hooks/useCollections'
import { UseCollectionDirectoryTreeHook } from '@comix/ui/hooks/useCollectionDirectoryTree'
import { SidebarView } from './Sidebar'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { list, generateCollection } from '../../test/generators'

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

it('displays collection directories', async () => {
  const { render, stubCollections, stubCollectionDirectories, waitForCollections } = await subject()
  const collections = list(generateCollection)

  stubCollections(collections)
  stubCollectionDirectories(undefined, [])
  render()

  await waitForCollections()

  expect.assertions(collections.length)
  collections.forEach(collection => {
    const elem = screen.getByTestId(`${collection.path}-directory`)
    expect(elem).toBeInTheDocument()
  })
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
        <MockDependencyProvider value={dependencies}>
          <MemoryRouter>
            <SidebarView />
          </MemoryRouter>
        </MockDependencyProvider>
      )
    }
  }
}
