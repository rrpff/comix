import path from 'path'
import { scan } from './scan'
import { fixturePath } from '../../test/helpers'

describe('scan', () => {
  it('returns the paths of all CBR and CBZ files in a directory as absolute paths', async () => {
    const results = await scan(fixturePath('folder'))
    expect(results).toEqual([
      fixturePath('folder', 'another-fake-file.cbr'),
    ])
  })

  it('scans recursively', async () => {
    const results = await scan(fixturePath('..'))
    expect(results).toContain(fixturePath('fake-comic-file.cbz'))
    expect(results).toContain(fixturePath('folder', 'another-fake-file.cbr'))
  })
})
