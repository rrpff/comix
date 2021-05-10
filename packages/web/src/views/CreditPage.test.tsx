import '@testing-library/jest-dom'
import { render, screen, waitFor } from '@testing-library/react'
import { CreditType, LibraryCredit } from '@comix/ui'
import { generateCollection, generateCredit, generateEntry, generateIssue, list } from '../../test/generators'
import { MockDependencyProvider, DependencyMap } from '../../test/MockDependencyProvider'
import { CreditPageView, CreditPageViewProps } from './CreditPage'

it('renders the credit name', async () => {
  const { render, stubCredit, generateCreditWithEntries } = await subject()

  const credit = generateCreditWithEntries('object')

  stubCredit(credit)
  render({ creditIdentifier: credit, type: 'object' })

  const title = await waitFor(() => screen.getByText(credit.name))
  expect(title).toBeInTheDocument()
})

it('renders comic files in the directory', async () => {
  const { render, stubCredit, generateCreditWithEntries } = await subject()

  const credit = generateCreditWithEntries('location')

  stubCredit(credit)
  render({ creditIdentifier: credit, type: 'location' })

  await waitFor(() => screen.getByText(credit.issues[0].name))

  expect.assertions(credit.issues.length)
  credit.issues.forEach(issue => {
    const elem = screen.getByText(issue.name)
    expect(elem).toBeInTheDocument()
  })
})

const subject = async () => {
  const collection = generateCollection()
  const dependencies: DependencyMap = {}

  const stubCredit = (credit: LibraryCredit) => {
    dependencies.useCredit = () => {
      return { credit, loading: false }
    }
  }

  const generateCreditWithEntries = (type: CreditType) => generateCredit({
    type: type,
    issues: list(() => generateIssue({
      entries: [{
        collection: { path: collection.path },
        entry: generateEntry(),
      }]
    }))
  })

  const waitForContent = () => waitFor(() => screen.getByTestId('contents'))

  return {
    collection,
    generateCreditWithEntries,
    stubCredit,
    waitForContent,
    render: (props: CreditPageViewProps) => {
      return render(
        <MockDependencyProvider value={dependencies}>
          <CreditPageView {...props} />
        </MockDependencyProvider>
      )
    }
  }
}
