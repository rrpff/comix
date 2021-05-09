import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { LibraryVolume } from '@comix/ui'
import { generateCollection, generateEntry, generateIssue, generateVolume, list } from '../../test/generators'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { VolumePageView, VolumePageViewProps } from './VolumePage'

it('renders the volume name', async () => {
  const { render, stubVolume, generateVolumeWithEntries } = await subject()

  const volume = generateVolumeWithEntries()

  stubVolume(volume)
  render({ volumeIdentifier: volume })

  const title = await waitFor(() => screen.getByText(volume.name))
  expect(title).toBeInTheDocument()
})

it('renders comic files in the directory', async () => {
  const { render, stubVolume, generateVolumeWithEntries } = await subject()

  const volume = generateVolumeWithEntries()

  stubVolume(volume)
  render({ volumeIdentifier: volume })

  await waitFor(() => screen.getByText(volume.issues[0].name))

  expect.assertions(volume.issues.length)
  volume.issues.forEach(issue => {
    const elem = screen.getByText(issue.name)
    expect(elem).toBeInTheDocument()
  })
})

const subject = async () => {
  const collection = generateCollection()
  const dependencies: DependencyMap = {}

  const stubVolume = (volume: LibraryVolume) => {
    dependencies.useVolume = () => {
      return { volume, loading: false }
    }
  }

  const generateVolumeWithEntries = (numIssues: number = 3) => generateVolume({
    issues: list(() => generateIssue({
      entries: [{
        collection: { path: collection.path },
        entry: generateEntry(),
      }]
    }), numIssues)
  })

  const waitForContent = () => waitFor(() => screen.getByTestId('contents'))

  return {
    collection,
    generateVolumeWithEntries,
    stubVolume,
    waitForContent,
    render: (props: VolumePageViewProps) => {
      return render(
        <MockDependencyProvider value={dependencies}>
          <VolumePageView {...props} />
        </MockDependencyProvider>
      )
    }
  }
}
