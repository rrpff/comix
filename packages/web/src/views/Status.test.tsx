import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { MemoryRouter } from 'react-router-dom'
import { LibraryEntry } from '@comix/ui'
import { generateEntry } from '../../test/generators'
import {
  StatusView,
  CREATE_SUBSCRIPTION,
  UPDATE_SUBSCRIPTION,
  DELETE_SUBSCRIPTION,
  FINISH_SUBSCRIPTION,
  UPDATE_LIBRARY_ENDPOINT,
} from './Status'

beforeEach(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

it('displays "Up to date" when not running', async () => {
  const { render } = await subject()

  render()

  const text = screen.getByTestId('status-text')
  expect(text).toContainHTML('Up to date')
})

it('displays "Creating" with the file name when creating', async () => {
  const { render, stubCreateSubscription } = await subject()
  const entry = generateEntry()

  stubCreateSubscription(entry)
  render()

  await waitFor(() => screen.getByText('Creating...'))

  const text = screen.getByTestId('status-text')
  expect(text).toContainHTML('Creating...')

  const subtext = screen.getByTestId('status-subtext')
  expect(subtext).toContainHTML(entry.fileName)
})

it('displays "Updating" with the file name when updating', async () => {
  const { render, stubUpdateSubscription } = await subject()
  const entry = generateEntry()

  stubUpdateSubscription(entry)
  render()

  await waitFor(() => screen.getByText('Updating...'))

  const text = screen.getByTestId('status-text')
  expect(text).toContainHTML('Updating...')

  const subtext = screen.getByTestId('status-subtext')
  expect(subtext).toContainHTML(entry.fileName)
})

it('displays "Cleaning up..." when deleting', async () => {
  const { render, stubDeleteSubscription } = await subject()
  const entry = generateEntry()

  stubDeleteSubscription(entry)
  render()

  await waitFor(() => screen.getByText('Cleaning up...'))

  const text = screen.getByTestId('status-text')
  expect(text).toContainHTML('Cleaning up...')

  const subtext = screen.getByTestId('status-subtext')
  expect(subtext).toBeEmptyDOMElement()
})

it('resets to "Up to date" when finished', async () => {
  const { render, stubDeleteSubscription, stubFinishSubscription } = await subject()
  const entry = generateEntry()

  stubDeleteSubscription(entry)
  stubFinishSubscription()
  render()

  await waitFor(() => screen.getByText('Cleaning up...'))
  await waitFor(() => screen.getByText('Up to date'))

  const text = screen.getByTestId('status-text')
  expect(text).toContainHTML('Up to date')

  const subtext = screen.queryByTestId('status-subtext')
  expect(subtext).not.toBeInTheDocument()
})

it('supports refreshing when up to date', async () => {
  jest.spyOn(window, 'fetch')

  const { render } = await subject()
  render()

  const link = screen.getByTestId('status-refresh')
  expect(link).toContainHTML('Refresh library')

  act(() => { fireEvent.click(link) })

  expect(window.fetch).toHaveBeenCalledWith(UPDATE_LIBRARY_ENDPOINT, { method: 'POST' })
})

const subject = async () => {
  const mocks = [] as MockedResponse[]

  const stubCreateSubscription = (entry: LibraryEntry) => {
    mocks.push({
      request: { query: CREATE_SUBSCRIPTION },
      result: { data: { entryCreated: { name: entry.fileName, path: entry.filePath } } },
    })
  }

  const stubUpdateSubscription = (entry: LibraryEntry) => {
    mocks.push({
      request: { query: UPDATE_SUBSCRIPTION },
      result: { data: { entryUpdated: { name: entry.fileName, path: entry.filePath } } },
    })
  }

  const stubDeleteSubscription = (entry: LibraryEntry) => {
    mocks.push({
      request: { query: DELETE_SUBSCRIPTION },
      result: { data: { entryDeleted: { path: entry.filePath } } },
    })
  }

  const stubFinishSubscription = () => {
    mocks.push({
      request: { query: FINISH_SUBSCRIPTION },
      result: { data: { libraryUpdateFinished: { success: true } } },
    })
  }

  return {
    mocks,
    stubCreateSubscription,
    stubUpdateSubscription,
    stubDeleteSubscription,
    stubFinishSubscription,
    render: () => {
      return render(
        <MockedProvider mocks={mocks} addTypename={false}>
          <MemoryRouter>
            <StatusView />
          </MemoryRouter>
        </MockedProvider>
      )
    }
  }
}
