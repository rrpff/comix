import { fixturePath } from '../test/helpers'
import { scanDirectory } from './'

it('returns all comic files as created if given no comparison', async () => {
  const changes = await scanDirectory(fixturePath(), [])

  expect(changes).toMatchObject({
    created: expect.arrayContaining([
      expect.objectContaining({ path: fixturePath('fake-comic-file.cbz') }),
      expect.objectContaining({ path: fixturePath('phonogram-sample.cbr') }),
      expect.objectContaining({ path: fixturePath('folder', 'another-fake-file.cbr') }),
    ])
  })
})

it('excludes files which have not changed since the comparison', async () => {
  const existing = { path: fixturePath('fake-comic-file.cbz'), lastModified: 1619311080211.2463 }
  const changes = await scanDirectory(fixturePath(), [existing])

  expect(changes.created).not.toContainEqual(existing)
})

it('marks missing files as deleted', async () => {
  const deleted = { path: fixturePath('deleted-file.cbr'), lastModified: 12345 }
  const changes = await scanDirectory(fixturePath(), [deleted])

  expect(changes.deleted).toContainEqual(deleted)
})

it('marks updated files as changed', async () => {
  const original = { path: fixturePath('fake-comic-file.cbz'), lastModified: 123 }
  const updated = { path: fixturePath('fake-comic-file.cbz'), lastModified: 1619311080211.2463 }

  const changes = await scanDirectory(fixturePath(), [original])

  expect(changes.created).not.toContainEqual(updated)
  expect(changes.changed).toContainEqual(updated)
})
