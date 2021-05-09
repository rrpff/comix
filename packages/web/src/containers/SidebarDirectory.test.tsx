import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { Directory, LibraryCollection } from '@comix/ui'
import { UseCollectionDirectoryTreeHook } from '@comix/ui/hooks/useCollectionDirectoryTree'
import { SidebarDirectory } from './SidebarDirectory'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { list, generateCollection, generateDirectory } from '../../test/generators'

it('displays directories in the root of each collection', async () => {
  const { render, stubCollectionDirectories, waitForDirectory } = await subject()
  const collection = generateCollection()
  const directories = list(generateDirectory)

  stubCollectionDirectories(collection, directories)
  render(collection)

  await waitForDirectory(collection.path)

  expect.assertions(directories.length)
  directories.forEach(directory => {
    const elem = screen.getByTestId(directory.path)
    expect(elem).toHaveTextContent(directory.name)
  })
})

it('includes a root directory for each collection', async () => {
  const { render, stubCollectionDirectories } = await subject()
  const collection = generateCollection()

  stubCollectionDirectories(undefined, [])
  render(collection)

  const elem = screen.getByTestId(`${collection.path}-root`)
  expect(elem).toHaveTextContent('(root)')
})

const subject = async () => {
  const dependencies: DependencyMap = {}

  const stubCollectionDirectories = (collection?: LibraryCollection, directories?: Directory[]) => {
    const stubUseCollectionDirectoryTree: UseCollectionDirectoryTreeHook = (inner?: LibraryCollection) => {
      const tree = collection === inner
        ? { name: collection?.name, path: collection?.path, directories }
        : { name: null, path: null, directories: [] }

      return { tree, loading: false }
    }

    dependencies['useCollectionDirectoryTree'] = stubUseCollectionDirectoryTree
  }

  const waitForDirectory = (path: string) => waitFor(() => screen.getByTestId(`${path}-directory`))

  return {
    stubCollectionDirectories,
    waitForDirectory,
    render: (collection: LibraryCollection) => {
      return render(
        <MockDependencyProvider value={dependencies}>
          <MemoryRouter>
            <SidebarDirectory collection={collection} />
          </MemoryRouter>
        </MockDependencyProvider>
      )
    }
  }
}
