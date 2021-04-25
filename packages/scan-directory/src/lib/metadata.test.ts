import fs from 'fs/promises'
import { metadata } from './metadata'
import { fixturePath } from '../../test/helpers'

describe('metadata', () => {
  it.each([
    fixturePath('whatever.cbr'),
    fixturePath('cool.cbr'),
  ])('throws an error if the file does not exist', async (fpath) => {
    await expect(metadata(fpath)).rejects
      .toEqual(new Error(`File does not exist: ${fpath}`))
  })

  it.each([
    'wytches-sample.cbz',
    'phonogram-sample.cbr',
  ])('returns metadata about the file', async (fname) => {
    const comic = await metadata(fixturePath(fname))

    expect(comic).toMatchObject({
      name: fname,
      path: fixturePath(fname),
      corrupt: false
    })
  })

  it.each([
    ['wytches-sample.cbz', fixturePath('wytches-sample', '0001.jpeg')],
    ['phonogram-sample.cbr', fixturePath('phonogram-sample', '0001.jpeg')],
  ])('generates a cover image for the file', async (fname, imagePath) => {
    const comic = await metadata(fixturePath(fname))

    expect(comic.coverData).not.toEqual(undefined)

    const expectedImageData = await fs.readFile(imagePath)
    const actualImageData = Buffer.from(comic.coverData!)

    expect(Buffer.compare(actualImageData, expectedImageData)).toEqual(0)
  })

  describe('when the file cannot be parsed', () => {
    beforeEach(() => {
      jest.spyOn(console, 'warn').mockImplementation(() => {})
      jest.spyOn(console, 'error').mockImplementation(() => {})
    })

    it.each([
      fixturePath('fake-comic-file.cbz'),
      fixturePath('folder', 'another-fake-file.cbr'),
    ])('marks the file corrupt', async (fpath) => {
      const comic = await metadata(fpath)

      expect(comic.corrupt).toEqual(true)
    })
  })
})
