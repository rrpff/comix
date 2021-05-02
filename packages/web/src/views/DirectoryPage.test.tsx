import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { Directory, LibraryCollection, LibraryEntry } from '@comix/ui'
import { generateCollection, generateDirectory, generateEntry, list } from '../../test/generators'
import { DirectoryPageView, DirectoryPageViewProps, ENTRIES_QUERY } from './DirectoryPage'

it('renders the directory name', async () => {
  const { render, stubEntries } = await subject()
  const collection = generateCollection()
  const directory = generateDirectory()
  const entries = list(generateEntry)

  stubEntries(collection, directory, entries)
  render({ collectionPath: collection.path, directoryPath: directory.path })

  const title = await waitFor(() => screen.getByText(directory.name))
  expect(title).toBeInTheDocument()
})

it('renders comic files in the directory', async () => {
  const { render, stubEntries } = await subject()
  const collection = generateCollection()
  const directory = generateDirectory()
  const entries = list(generateEntry)

  stubEntries(collection, directory, entries)
  render({ collectionPath: collection.path, directoryPath: directory.path })

  await waitFor(() => screen.getByText(entries[0].fileName))

  expect.assertions(entries.length)
  entries.forEach(entry => {
    const elem = screen.getByText(entry.fileName)
    expect(elem).toBeInTheDocument()
  })
})

it('renders comic files in title order', async () => {
  const { render, stubEntries } = await subject()
  const collection = generateCollection()
  const directory = generateDirectory()
  const entries = list(generateEntry, 15)

  stubEntries(collection, directory, entries)
  render({ collectionPath: collection.path, directoryPath: directory.path })

  await waitFor(() => screen.getByText(entries[0].fileName))

  const contents = screen.getByTestId('contents')
  const comicElems = Array.from(contents.querySelectorAll('section[data-testid]'))
  const comicTitlesInPageOrder = comicElems.map(elem => elem.getAttribute('data-testid'))
  const comicTitlesInExpectedOrder = [...comicTitlesInPageOrder].sort()

  expect(comicTitlesInPageOrder).toEqual(comicTitlesInExpectedOrder)
})

const subject = async () => {
  const mocks = [] as MockedResponse[]

  const stubEntries = (collection: LibraryCollection, directory: Directory, entries: LibraryEntry[]) => {
    mocks.push({
      result: { data: { entries, directory } },
      request: { query: ENTRIES_QUERY, variables: {
        entriesInput: { collection: collection.path, directoryPath: directory.path },
        directoryInput: { path: directory.path },
      } },
    })
  }

  const waitForContent = () => waitFor(() => screen.getByTestId('contents'))

  return {
    mocks,
    stubEntries,
    waitForContent,
    render: (props: DirectoryPageViewProps) => {
      return render(
        <MockedProvider mocks={mocks}>
          <DirectoryPageView {...props} />
        </MockedProvider>
      )
    }
  }
}
