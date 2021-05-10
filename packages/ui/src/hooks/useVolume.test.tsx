import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react-hooks'
import { generateCollection, generateEntry, generateIssue, generateReadingProgress, generateVolume, list } from '../../test/generators'
import { LibraryIdentifier } from '../types'
import { QUERY, useVolume } from './useVolume'

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render({ source: 'whatever', sourceId: '123' })

  expect(result.current.loading).toEqual(true)
})

it('returns the volume with its issues', async () => {
  const { mocks, render } = subject()

  const collection = generateCollection()
  const volume = generateVolume({
    issues: list(() => generateIssue({
      entries: list(() => {
        return {
          collection: { path: collection.path },
          entry: generateEntry({
            progress: generateReadingProgress()
          }),
        }
      })
    }))
  })

  const identifier = { source: volume.source, sourceId: volume.sourceId }

  mocks.push({
    result: { data: { volume } },
    request: { query: QUERY, variables: { input: identifier } },
  })

  const { result, waitForNextUpdate } = render(identifier)
  await waitForNextUpdate()

  volume.issues!.forEach(issue => delete issue.volume)
  expect(result.current.volume).toMatchObject(volume)
})

const subject = () => {
  const mocks = [] as MockedResponse[]
  const wrapper: React.FC = ({ children }) => (
    <MockedProvider mocks={mocks} addTypename={false}>
      {children}
    </MockedProvider>
  )

  return {
    mocks,
    render: (identifier: LibraryIdentifier) => {
      return renderHook(() => useVolume(identifier), { wrapper })
    }
  }
}
