import { scan } from './scan'
import { fixturePath } from '../../test/helpers'

it.each([
  [['cbz'], { path: fixturePath('fake-comic-file.cbz') }],
  [['cbr'], { path: fixturePath('folder', 'another-fake-file.cbr') }],
])('returns paths in a directory matching given extensions', async (extensions, expectedResult) => {
  const results = await scan(fixturePath(), extensions)
  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining(expectedResult)
    ])
  )
})

it.each([
  [['cbz'], { path: fixturePath('folder', 'another-fake-file.cbr') }],
  [['cbr'], { path: fixturePath('fake-comic-file.cbz') }],
])('excludes paths not matching given extensions', async (extensions, invalidResult) => {
  const results = await scan(fixturePath(), extensions)
  expect(results).not.toEqual(
    expect.arrayContaining([
      expect.objectContaining(invalidResult)
    ])
  )
})

it('returns last modified times', async () => {
  const results = await scan(fixturePath('folder'), ['cbr', 'cbz'])
  expect(results).toMatchObject([{
    lastModified: 1619311097052.7192
  }])
})

it('scans recursively', async () => {
  const results = await scan(fixturePath('..'), ['cbr', 'cbz'])
  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ path: fixturePath('fake-comic-file.cbz') }),
      expect.objectContaining({ path: fixturePath('folder', 'another-fake-file.cbr') }),
    ])
  )
})
