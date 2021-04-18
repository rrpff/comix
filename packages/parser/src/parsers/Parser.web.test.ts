/**
 * @jest-environment jsdom
 */

import path from 'path'
import fs from 'fs'
import { Parser } from './Parser'
import { ComicImage } from '../protocols'

const EXAMPLES = [
  {
    name: 'cbz - example 1',
    comicFileName: 'wytches-sample.cbz',
    imageFilePaths: [
      'wytches-sample/0001.jpeg',
      'wytches-sample/0002.jpeg',
      'wytches-sample/0003.jpeg',
      'wytches-sample/0004.jpeg',
    ]
  },
  {
    name: 'cbz - example 2',
    comicFileName: 'phonogram-sample.cbz',
    imageFilePaths: [
      'phonogram-sample/0001.jpeg',
      'phonogram-sample/0002.jpeg',
      'phonogram-sample/0003.jpeg',
      'phonogram-sample/0004.jpeg',
      'phonogram-sample/0005.jpeg',
    ]
  },
  {
    name: 'cbr - example 1',
    comicFileName: 'wytches-sample.cbr',
    imageFilePaths: [
      'wytches-sample/0001.jpeg',
      'wytches-sample/0002.jpeg',
      'wytches-sample/0003.jpeg',
      'wytches-sample/0004.jpeg',
    ]
  },
  {
    name: 'cbr - example 2',
    comicFileName: 'phonogram-sample.cbr',
    imageFilePaths: [
      'phonogram-sample/0001.jpeg',
      'phonogram-sample/0002.jpeg',
      'phonogram-sample/0003.jpeg',
      'phonogram-sample/0004.jpeg',
      'phonogram-sample/0005.jpeg',
    ]
  },
]

EXAMPLES.forEach(({ name, comicFileName, imageFilePaths }) => {
  describe(name, () => {
    const subject = async () => {
      const subject = new Parser()
      const file = await openW3cFile(fixturePath(comicFileName))
      return await subject.parse(file)
    }

    it('includes the name', async () => {
      const comic = await subject()
      expect(comic.name).toEqual(comicFileName)
    })

    it('includes the correct number of images', async () => {
      const comic = await subject()
      expect(comic.images.length).toEqual(imageFilePaths.length)
    })

    it('includes images sorted by index', async () => {
      const comic = await subject()
      expect(comic.images.map(p => [p.index, p.name])).toEqual(
        imageFilePaths.map((path, index) => [index, path])
      )
    })

    it.each(
      imageFilePaths.map((path, index): [number, string] => [index, path])
    )('can read image contents correctly', async (index, expectedImagePath) => {
      const comic = await subject()
      const image = comic.images[index]

      expectImageToMatchFile(image, fixturePath(expectedImagePath))
    })
  })
})

it('should error on an unsupported file extension', async () => {
  const subject = new Parser()
  const file = await openW3cFile(fixturePath('wytches-sample.cbz'))
  ;(file as any).name = 'something.cbx'

  await expect(subject.parse(file)).rejects
    .toEqual(new Error('Unsupported file type: cbx'))
})

async function expectImageToMatchFile(image: ComicImage, fpath: string) {
  const expectedBuf = await fs.promises.readFile(fpath)
  const actualBuf = Buffer.from(await image.read())
  const isMatch = 0 === Buffer.compare(expectedBuf, actualBuf)

  expect(isMatch).toEqual(true)
}

async function openW3cFile(fpath: string): Promise<File> {
  const buf = await fs.promises.readFile(fpath)
  const blob = new Blob([buf], { type: '' })
  ;(blob as any).arrayBuffer = async () => buf.buffer
  ;(blob as any).lastModified = 1618455939000
  ;(blob as any).name = path.basename(fpath)

  return <File>blob
}

function fixturePath(...sections: string[]) {
  return path.join(__dirname, '..', '..', 'test', 'fixtures', ...sections)
}
