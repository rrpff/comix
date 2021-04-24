import { ListDirectory } from './ListDirectory'

it('returns no files or directories when there are none', async () => {
  const filesystem = { readdir: jest.fn(() => []) }
  const result = await ListDirectory(__dirname, filesystem)

  expect(result.success?.files).toEqual([])
  expect(result.success?.directories).toEqual([])
})

it('returns files and directories when there are some', async () => {
  const files = [
    { name: 'thing.cbz', isFile: () => true, isDirectory: () => false },
    { name: 'American Vampire', isFile: () => false, isDirectory: () => true },
  ]
  const filesystem = { readdir: jest.fn(() => files) }
  const result = await ListDirectory('/whatever', filesystem)

  expect(result.success).toEqual({
    files: [{
      name: 'thing.cbz',
      path: '/whatever/thing.cbz'
    }],
    directories: [{
      name: 'American Vampire',
      path: '/whatever/American Vampire'
    }],
  })
})
