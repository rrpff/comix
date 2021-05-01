import { render, screen, waitFor } from '@testing-library/react'
import { MockedProvider } from '@apollo/client/testing'
import { Chrome } from './Chrome'

it('renders a sidebar', async () => {
  const { render } = await subject()
  render()

  const sidebar = await waitFor(() => screen.getByTestId('sidebar'))
  expect(sidebar).toBeInTheDocument()
})

const subject = async () => {
  return {
    render: () => {
      return render(
        <MockedProvider>
          <Chrome />
        </MockedProvider>
      )
    }
  }
}
