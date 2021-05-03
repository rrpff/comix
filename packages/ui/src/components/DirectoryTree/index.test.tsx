import '@testing-library/jest-dom'
import { render, act, fireEvent, screen, waitFor } from '@testing-library/react'
import { generateDirectory, pick } from '../../../test/generators'
import { DirectoryTree, DirectoryTreeProps } from './'

it('displays the directories in the directory', async () => {
  const { render } = await subject()
  const directory = generateDirectory()

  render({ directory })

  expect.assertions(directory.directories!.length)
  directory.directories!.forEach(file => {
    const elem = screen.getByTestId(file.path)
    expect(elem).toHaveTextContent(file.name)
  })
})

it('does not display directories when showDirectories is false', async () => {
  const { render } = await subject()
  const directory = generateDirectory()

  render({ directory, showDirectories: false })

  expect.assertions(directory.directories!.length)
  directory.directories!.forEach(file => {
    const elem = screen.queryByTestId(file.path)
    expect(elem).not.toBeInTheDocument()
  })
})

it('expands a directory when clicking it', async () => {
  const { render } = await subject()
  const directory = generateDirectory(2)
  const desiredSubdir = pick(directory.directories!)

  render({ directory })

  const subdir = screen.getByTestId(desiredSubdir.path)
  act(() => { fireEvent.click(subdir) })

  await waitFor(() => screen.getByTestId(desiredSubdir.directories![0].path))

  expect.assertions(directory.directories!.length)
  desiredSubdir.directories!.forEach(dir => {
    const elem = screen.getByTestId(dir.path)
    expect(elem).toHaveTextContent(dir.name)
  })
})

it('collapses a directory when clicking it again', async () => {
  const { render } = await subject()
  const directory = generateDirectory(2)
  const desiredSubdir = pick(directory.directories!)

  render({ directory })

  const subdir = screen.getByTestId(desiredSubdir.path)
  act(() => { fireEvent.click(subdir) })

  await waitFor(() => screen.getByTestId(desiredSubdir.directories![0].path))

  act(() => { fireEvent.click(subdir) })

  expect.assertions(directory.directories!.length)
  desiredSubdir.directories!.forEach(dir => {
    const elem = screen.queryByTestId(dir.path)
    expect(elem).not.toBeInTheDocument()
  })
})

it('displays the files in the directory', async () => {
  const { render } = await subject()
  const directory = generateDirectory()

  render({ directory })

  expect.assertions(directory.files!.length)
  directory.files!.forEach(file => {
    const elem = screen.getByTestId(file.path)
    expect(elem).toHaveTextContent(file.name)
  })
})

it('does not display files when showFiles is false', async () => {
  const { render } = await subject()
  const directory = generateDirectory()

  render({ directory, showFiles: false })

  expect.assertions(directory.files!.length)
  directory.files!.forEach(file => {
    const elem = screen.queryByTestId(file.path)
    expect(elem).not.toBeInTheDocument()
  })
})

const subject = async () => {
  return {
    render: (props: DirectoryTreeProps) => {
      return render(
        <DirectoryTree {...props} />
      )
    }
  }
}
