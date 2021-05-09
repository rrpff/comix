import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { LibraryCollection, LibraryVolume } from '@comix/ui'
import { UseVolumesHook } from '@comix/ui/hooks/useVolumes'
import { SidebarVolumes } from './SidebarVolumes'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { list, generateCollection, generateVolume } from '../../test/generators'

it('displays volumes for each collection', async () => {
  const { render, stubCollectionVolumes, waitForVolumes } = await subject()
  const collection = generateCollection()
  const volumes = list(generateVolume)

  stubCollectionVolumes(collection, volumes)
  render(collection)

  await waitForVolumes(collection.path)

  expect.assertions(volumes.length)
  volumes.forEach(volume => {
    const elem = screen.getByTestId(volume.sourceId)
    expect(elem).toHaveTextContent(volume.name)
  })
})

const subject = async () => {
  const dependencies: DependencyMap = {}

  const stubCollectionVolumes = (collection?: LibraryCollection, volumes?: LibraryVolume[]) => {
    const stubUseVolumes: UseVolumesHook = () => {
      return { volumes, loading: false }
    }

    dependencies['useVolumes'] = stubUseVolumes
  }

  const waitForVolumes = (path: string) => waitFor(() => screen.getByTestId(`${path}-volumes`))

  return {
    stubCollectionVolumes,
    waitForVolumes,
    render: (collection: LibraryCollection) => {
      return render(
        <MockDependencyProvider value={dependencies}>
          <MemoryRouter>
            <SidebarVolumes collection={collection} />
          </MemoryRouter>
        </MockDependencyProvider>
      )
    }
  }
}
