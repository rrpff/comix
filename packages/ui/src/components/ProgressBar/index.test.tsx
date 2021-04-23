import { render, screen } from '@testing-library/react'
import { ProgressBar } from './'

it('should have a width of 50% when progress is 0.5', () => {
  render(<ProgressBar progress={0.5} />)

  const bar = screen.getByTestId('progress')
  expect(bar).toHaveStyle({ 'width': '50%' })
})

it('should have a width of 0% when progress is negative', () => {
  render(<ProgressBar progress={-0.5} />)

  const bar = screen.getByTestId('progress')
  expect(bar).toHaveStyle({ 'width': '0%' })
})

it('should have a width of 100% when progress is greater than 1', () => {
  render(<ProgressBar progress={1.5} />)

  const bar = screen.getByTestId('progress')
  expect(bar).toHaveStyle({ 'width': '100%' })
})

it('should have a width representative of the current progress', () => {
  const progress = Math.random()
  const expectedWidth = progress * 100
  render(<ProgressBar progress={progress} />)

  const bar = screen.getByTestId('progress')
  expect(bar).toHaveStyle({ 'width': `${expectedWidth}%` })
})
