import 'buffer'
import { Reader } from './Reader'
import { fixtureBuffer, fixturePath, openW3cFile } from '../test/helpers'
import { ComicImage } from './protocols'

const subject = async () => {
  const file = await openW3cFile(fixturePath('different-sizes.cbz'))
  return await Reader.read(file)
}

const goToSinglePage = (reader: Reader) => reader.goto(0)
const goToDoublePage = (reader: Reader) => reader.goto(3)
const goToAdjacentSinglePages = (reader: Reader) => reader.goto(1)
const goToSinglePageWithAdjacentDoublePage = (reader: Reader) => reader.goto(4)
const goToLastPage = (reader: Reader) => reader.goto(6)

it('has the correct name', async () => {
  const reader = await subject()
  expect(reader.comic.name).toEqual('different-sizes.cbz')
})

it('has the correct images', async () => {
  const reader = await subject()
  const images = reader.comic.images.map(i => i.name)

  expect(images).toEqual([
    'different-sizes/0001.jpg',
    'different-sizes/0002.jpg',
    'different-sizes/0003.jpg',
    'different-sizes/0004.jpg',
    'different-sizes/0005.jpg',
    'different-sizes/0006.jpg',
    'different-sizes/0007.jpg',
  ])
})

it('starts with the first image', async () => {
  const reader = await subject()
  expect(reader.currentIndex).toEqual(0)
  expect(reader.current).toMatchObject([{
    type: 'single',
    imageIndex: 0,
    imageName: 'different-sizes/0001.jpg'
  }])
})

it('calculates image dimensions', async () => {
  const reader = await subject()
  await reader.goto(0)

  expect(reader.current).toMatchObject([{
    imageWidth: 1987,
    imageHeight: 3056,
  }])
})

it('determines single images correctly', async () => {
  const reader = await subject()
  await goToSinglePage(reader)

  expect(reader.current![0].type).toEqual('single')
})

it('determines double images correctly', async () => {
  const reader = await subject()
  await goToDoublePage(reader)

  expect(reader.current![0].type).toEqual('double')
})

it('puts two adjacent single width images on one page', async () => {
  const reader = await subject()
  await goToAdjacentSinglePages(reader)

  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 1, imageName: 'different-sizes/0002.jpg' },
    { type: 'single', imageIndex: 2, imageName: 'different-sizes/0003.jpg' },
  ])
})

it('puts one double width image on one page', async () => {
  const reader = await subject()
  await goToDoublePage(reader)

  expect(reader.current).toMatchObject([
    { type: 'double', imageIndex: 3, imageName: 'different-sizes/0004.jpg' }
  ])
})

it('puts one single width image on one page if the next image is a double', async () => {
  const reader = await subject()
  await goToSinglePageWithAdjacentDoublePage(reader)

  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 4, imageName: 'different-sizes/0005.jpg' }
  ])
})

it('puts one single width image on one page if it is the last image', async () => {
  const reader = await subject()
  await goToLastPage(reader)

  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 6, imageName: 'different-sizes/0007.jpg' }
  ])
})

it('goes forward one page when calling next on one single page', async () => {
  const reader = await subject()
  await reader.next()

  expect(reader.currentIndex).toEqual(1)
  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 1, imageName: 'different-sizes/0002.jpg' },
    { type: 'single', imageIndex: 2, imageName: 'different-sizes/0003.jpg' },
  ])
})

it('goes forward two pages when calling next on two single pages', async () => {
  const reader = await subject()
  await goToAdjacentSinglePages(reader)
  await reader.next()

  expect(reader.currentIndex).toEqual(3)
  expect(reader.current).toMatchObject([
    { type: 'double', imageIndex: 3, imageName: 'different-sizes/0004.jpg' },
  ])
})

it('goes forward one page when calling next on one double page', async () => {
  const reader = await subject()
  await goToDoublePage(reader)
  await reader.next()

  expect(reader.currentIndex).toEqual(4)
  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 4, imageName: 'different-sizes/0005.jpg' },
  ])
})

it('goes back two single pages when calling previous', async () => {
  const reader = await subject()
  await goToDoublePage(reader)
  await reader.previous()

  expect(reader.currentIndex).toEqual(1)
  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 1, imageName: 'different-sizes/0002.jpg' },
    { type: 'single', imageIndex: 2, imageName: 'different-sizes/0003.jpg' },
  ])
})

it('goes back one double page when calling previous', async () => {
  const reader = await subject()
  await reader.goto(4)
  await reader.previous()

  expect(reader.currentIndex).toEqual(3)
  expect(reader.current).toMatchObject([
    { type: 'double', imageIndex: 3, imageName: 'different-sizes/0004.jpg' },
  ])
})

it('does nothing when calling previous on the first page', async () => {
  const reader = await subject()
  await reader.previous()

  expect(reader.currentIndex).toEqual(0)
  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 0, imageName: 'different-sizes/0001.jpg' },
  ])
})

it('does nothing when calling next on the last page', async () => {
  const reader = await subject()
  await goToLastPage(reader)

  await reader.next()

  expect(reader.currentIndex).toEqual(6)
  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 6, imageName: 'different-sizes/0007.jpg' },
  ])
})

it('caches current and surrounding pages', async () => {
  const comic = createSpyComic(10)
  const reader = new Reader(comic)

  await reader.goto(5)
  await sleep()
  expect(reader.cache.map(p => p.imageIndex).sort()).toEqual([3, 4, 5, 6, 7, 8])

  await reader.next()
  await sleep()
  expect(reader.cache.map(p => p.imageIndex).sort()).toEqual([5, 6, 7, 8, 9])

  await reader.next()
  await sleep()
  expect(reader.cache.map(p => p.imageIndex).sort()).toEqual([7, 8, 9])

  await reader.previous()
  await sleep()
  expect(reader.cache.map(p => p.imageIndex).sort()).toEqual([5, 6, 7, 8, 9])
})

it('unloads and reloads cached pages', async () => {
  const comic = createSpyComic(10)
  const reader = new Reader(comic)

  await reader.goto(5)
  await sleep()
  await reader.next()
  await sleep()
  await reader.next()
  await sleep()
  await reader.previous()
  await sleep()

  comic.expectImageToHaveBeenLoadedTimes(3, 1)
  comic.expectImageToHaveBeenLoadedTimes(4, 1)
  comic.expectImageToHaveBeenLoadedTimes(5, 2)
  comic.expectImageToHaveBeenLoadedTimes(6, 2)
  comic.expectImageToHaveBeenLoadedTimes(7, 1)
  comic.expectImageToHaveBeenLoadedTimes(8, 1)
  comic.expectImageToHaveBeenLoadedTimes(9, 1)
})

it('caches surrounding pages in the background', async () => {
  const comic = createSpyComic(10)
  const reader = new Reader(comic)

  await reader.goto(5)
  expect(reader.cache.map(p => p.imageIndex).sort()).toEqual([5, 6])

  await sleep()
  expect(reader.cache.map(p => p.imageIndex).sort()).toEqual([3, 4, 5, 6, 7, 8])
})

it('does nothing when trying to goto an invalid index', async () => {
  const reader = await subject()
  await reader.goto(1000)

  expect(reader.currentIndex).toEqual(0)
  expect(reader.current).toMatchObject([
    { type: 'single', imageIndex: 0, imageName: 'different-sizes/0001.jpg' },
  ])
})


const sleep = () => new Promise(resolve => setTimeout(resolve, 10))

const createSpyComic = (numPages: number) => {
  const images = [] as ComicImage[]
  for (let i = 0; i < numPages; i++) {
    images.push({
      index: i,
      name: `000${i}.jpg`,
      read: jest.fn(async () => {
        const buf = await fixtureBuffer('small-single.jpg')
        return buf.buffer
      })
    })
  }

  return {
    name: 'spy-comic.cbz',
    images: images,
    expectImageToHaveBeenLoadedTimes: (imageIndex: number, expectedTimes: number) => {
      try {
        expect(images[imageIndex].read).toHaveBeenCalledTimes(expectedTimes)
      } catch (e) {
        e.message = e.message.split('\n').map((m: string, i: number) => i === 0
          ? `${m} for image ${imageIndex}`
          : m).join('\n')

        throw e
      }
    }
  }
}
