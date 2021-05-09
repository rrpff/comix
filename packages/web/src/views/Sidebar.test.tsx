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

describe('when viewing volumes', () => {
  it('displays collection volumes', async () => {
    const t = await subject()

    t.render()

    await t.waitForCollections()

    const modeSelect = screen.getByTestId('view-mode')
    act(() => { fireEvent.change(modeSelect, { target: { value: 'volumes' } }) })

    await t.waitForVolumes()

    expect.assertions(t.collections.length)
    t.collections.forEach(collection => {
      const elem = screen.getByTestId(`${collection.path}-volumes`)
      expect(elem).toBeInTheDocument()
    })
  })
})

describe('when viewing directories', () => {
  it('displays collection directories', async () => {
    const t = await subject()

    t.render()

    await t.waitForCollections()

    const modeSelect = screen.getByTestId('view-mode')
    act(() => { fireEvent.change(modeSelect, { target: { value: 'directories' } }) })

    await t.waitForDirectories()

    expect.assertions(t.collections.length)
    t.collections.forEach(collection => {
      const elem = screen.getByTestId(`${collection.path}-directory`)
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
    }
  }

  const waitForCollections = () => waitFor(() => screen.getByTestId('collections'))
  const waitForDirectories = () => waitFor(() => screen.getByTestId(`${collections[0].path}-directory`))
  const waitForVolumes = () => waitFor(() => screen.getByTestId(`${collections[0].path}-volumes`))

  return {
    collections,
    waitForCollections,
    waitForDirectories,
    waitForVolumes,
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
