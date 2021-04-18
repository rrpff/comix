import sizeOf from 'buffer-image-size'
import { Parser } from './parsers/Parser'
import { Comic, ComicPage, ComicReader } from './protocols'

export class Reader implements ComicReader {
  static async read(file: File): Promise<Reader> {
    const parser = new Parser()
    const comic = await parser.parse(file)
    const reader = new Reader(comic)
    await reader.goto(0)

    return reader
  }

  public current?: ComicPage[]
  public currentIndex?: number
  public cache: ComicPage[] = []

  public constructor(public comic: Comic) {}

  public async previous() {
    const checkingIndices = [this.currentIndex! - 1, this.currentIndex! - 1]
    const validIndices = checkingIndices.filter(index => index >= 0).reverse()
    const previousPages = await Promise.all(validIndices.map(index => this.loadPage(index)))

    const [previous, beforeThat] = previousPages

    if (previous === undefined) return
    if (previous?.type === 'single' && beforeThat?.type === 'single')
      return await this.goto(this.currentIndex! - 2)

    await this.goto(this.currentIndex! - 1)
  }

  public async next() {
    const desiredNextIndex = this.currentIndex! + this.current!.length
    const lastIndex = this.comic.images.length - 1
    const nextIndex = Math.min(desiredNextIndex, lastIndex)

    if (nextIndex !== this.currentIndex)
      await this.goto(nextIndex)
  }

  public async goto(imageIndex: number) {
    const lastIndex = this.comic.images.length - 1
    if (imageIndex > lastIndex || imageIndex < 0) return

    const image = await this.loadPage(imageIndex)
    const pages = [image]

    const isNotCover = imageIndex > 0
    const isSingleImage = image.type === 'single'
    const nextPageExists = imageIndex + 1 < this.comic.images.length

    if (isNotCover && isSingleImage && nextPageExists) {
      const nextPage = await this.loadPage(imageIndex + 1)
      if (nextPage.type === 'single') {
        pages.push(nextPage)
      }
    }

    // const preloadIndices = [
    //   Math.max(imageIndex - 1, 0),
    //   Math.max(imageIndex - 2, 0),
    //   Math.min(imageIndex + 1, lastIndex),
    //   Math.min(imageIndex + 2, lastIndex),
    // ]

    const minCachedIndex = Math.max(imageIndex - 2, 0)
    const maxCachedIndex = Math.min(imageIndex + 1 + pages.length, lastIndex)

    this.cache = this.cache.filter(page => page.imageIndex >= minCachedIndex
      && page.imageIndex <= maxCachedIndex)

    for (let i = minCachedIndex; i <= maxCachedIndex; i++)
      this.loadPage(i)

    this.currentIndex = imageIndex
    this.current = pages
  }

  private async loadPage(imageIndex: number): Promise<ComicPage> {
    const cached = this.cache.find(page => page.imageIndex === imageIndex)
    if (cached) return cached

    const image = this.comic.images[imageIndex]
    const imageData = await image.read()
    const imageDimensions = sizeOf(Buffer.from(imageData))
    const type = imageDimensions.width < imageDimensions.height
      ? 'single'
      : 'double'

    const page = {
      type: type as 'single' | 'double',
      imageWidth: imageDimensions.width,
      imageHeight: imageDimensions.height,
      imageIndex: imageIndex,
      imageName: image.name,
      image: new ArrayBuffer(1)
    }

    this.cache.push(page)
    return page
  }
}
