import '@testing-library/jest-dom'
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { SidebarView } from './Sidebar'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { list, generateCollection } from '../../test/generators'

it('displays all collections', async () => {
  const t = await subject()

  t.render()

  await t.waitForCollections()

  expect.assertions(t.collections.length)
  t.collections.forEach(collection => {
    const elem = screen.getByTestId(collection.path)
    expect(elem).toHaveTextContent(collection.name)
  })
})

describe.each([
  { value: 'directories', testIdSuffix: 'directory' },
  { value: 'volumes', testIdSuffix: 'volumes' },
  { value: 'characters', testIdSuffix: 'credits-character' },
  { value: 'concepts', testIdSuffix: 'credits-concept' },
  { value: 'locations', testIdSuffix: 'credits-location' },
  { value: 'objects', testIdSuffix: 'credits-object' },
  { value: 'people', testIdSuffix: 'credits-person' },
  { value: 'storyArcs', testIdSuffix: 'credits-storyArc' },
  { value: 'teams', testIdSuffix: 'credits-team' },
])('view modes', ({ value, testIdSuffix }) => {
  it(`displays ${value}`, async () => {
    const t = await subject()

    t.render()

    await t.waitForCollections()

    const modeSelect = screen.getByTestId('view-mode')
    act(() => { fireEvent.change(modeSelect, { target: { value } }) })

    await t.waitForTestId(`${t.collections[0].path}-${testIdSuffix}`)

    expect.assertions(t.collections.length)
    t.collections.forEach(collection => {
      const elem = screen.getByTestId(`${collection.path}-${testIdSuffix}`)
      expect(elem).toBeInTheDocument()
    })
  })
})

const subject = async () => {
  const collections = list(generateCollection)
  const dependencies: DependencyMap = {
    useCollections: () => {
      return { collections, loading: false }
    },
    useCollectionDirectoryTree: () => {
      return { name: null, path: null, directories: [] }
    },
    useVolumes: () => {
      return { volumes: [], loading: false }
    },
    useCredits: () => {
      return { credits: [], loading: false }
    }
  }

  const waitForCollections = () => waitFor(() => screen.getByTestId('collections'))
  const waitForTestId = (testId: string) => waitFor(() => screen.getByTestId(testId))

  return {
    collections,
    waitForCollections,
    waitForTestId,
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
