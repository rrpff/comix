import { scan } from './scan'
import { fixturePath } from '../../test/helpers'

it('returns the paths of all CBR and CBZ files in a directory as absolute paths', async () => {
  const results = await scan(fixturePath('folder'))
  expect(results).toMatchObject([{
    path: fixturePath('folder', 'another-fake-file.cbr'),
  }])
})

it('returns last modified times', async () => {
  const results = await scan(fixturePath('folder'))
  expect(results).toMatchObject([{
    lastModified: 1619311097052.7192
  }])
})

it('scans recursively', async () => {
  const results = await scan(fixturePath('..'))
  expect(results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({ path: fixturePath('fake-comic-file.cbz') }),
      expect.objectContaining({ path: fixturePath('folder', 'another-fake-file.cbr') }),
    ])
  )
})
