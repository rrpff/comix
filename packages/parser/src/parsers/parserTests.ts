import { expectImageToMatchFile, fixturePath } from '../../test/helpers'
import { Comic } from '../protocols'

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
    name: 'cbz - with nested images',
    comicFileName: 'nested-images.cbz',
    imageFilePaths: [
      'nested-images/Images/0001.jpg',
      'nested-images/Images/0002.jpg',
      'nested-images/Images/0003.jpg',
      'nested-images/Images/0004.jpg',
      'nested-images/Images/0005.jpg',
      'nested-images/Images/Deeper/0006.jpg',
      'nested-images/Images/Deeper/0007.jpg',
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
  {
    name: 'cbr - with nested images',
    comicFileName: 'nested-images.cbr',
    imageFilePaths: [
      'nested-images/Images/0001.jpg',
      'nested-images/Images/0002.jpg',
      'nested-images/Images/0003.jpg',
      'nested-images/Images/0004.jpg',
      'nested-images/Images/0005.jpg',
      'nested-images/Images/Deeper/0006.jpg',
      'nested-images/Images/Deeper/0007.jpg',
    ]
  },
]

export const runParserTests = (mode: string, read: (fpath: string, name?: string) => Promise<Comic>) => {
  EXAMPLES.forEach(({ name, comicFileName, imageFilePaths }) => {
    describe(`${mode} - ${name}`, () => {
      const subject = () => read(comicFileName)

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
    await expect(read('wytches-sample.cbz', 'whatever.cbx')).rejects
      .toEqual(new Error('Unsupported file type: cbx'))
  })
}
