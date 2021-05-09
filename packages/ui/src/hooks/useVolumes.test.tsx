import { MockedProvider, MockedResponse } from '@apollo/client/testing'
import { renderHook } from '@testing-library/react-hooks'
import { generateCollection, generateVolume, list } from '../../test/generators'
import { QUERY, useVolumes } from './useVolumes'

it('returns loading initially', () => {
  const { render } = subject()
  const { result } = render('/whatever')

  expect(result.current.error).toBeUndefined()
  expect(result.current.loading).toEqual(true)
})

it('returns all volumes', async () => {
  const { mocks, render } = subject()

  const collection = generateCollection().path
  const volumes = list(generateVolume)

  mocks.push({
    request: { query: QUERY, variables: { input: { collection } } },
    result: { data: { volumes } },
  })

  const { result, waitForNextUpdate } = render(collection)
  await waitForNextUpdate()

  expect(result.current.error).toBeUndefined()
  expect(result.current.volumes).toEqual(volumes)
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
    render: (collection: string) => {
      return renderHook(() => useVolumes(collection), { wrapper })
    }
  }
}
