import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { CreditType, LibraryCollection, UseCreditsHook } from '@comix/ui'
import { SidebarCredits } from './SidebarCredits'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { list, generateCollection, generateCredit } from '../../test/generators'

it('displays credits for each collection', async () => {
  const { render, stubCollectionCredits, waitForCredits } = await subject()
  const collection = generateCollection()
  const credits = list(() => generateCredit({ type: 'character' }))

  stubCollectionCredits(collection, credits)
  render(collection, 'character')

  await waitForCredits(collection.path)

  expect.assertions(credits.length)
  credits.forEach(credit => {
    const elem = screen.getByTestId(credit.sourceId)
    expect(elem).toHaveTextContent(credit.name)
  })
})

const subject = async () => {
  const dependencies: DependencyMap = {}

  const stubCollectionCredits = (collection?: LibraryCollection, credits?: any[]) => {
    const stubUseCredits: UseCreditsHook = () => {
      return { credits, loading: false }
    }

    dependencies.useCredits = stubUseCredits
  }

  const waitForCredits = (path: string) => waitFor(() => screen.getByTestId(`${path}-credits-character`))

  return {
    stubCollectionCredits,
    waitForCredits,
    render: (collection: LibraryCollection, type: CreditType) => {
      return render(
        <MockDependencyProvider value={dependencies}>
          <MemoryRouter>
            <SidebarCredits collection={collection} type={type} />
          </MemoryRouter>
        </MockDependencyProvider>
      )
    }
  }
}
