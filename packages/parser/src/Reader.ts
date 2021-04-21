import { Parser } from './parsers/Parser'
import { Comic, ComicPage, ComicReader } from './protocols'
const sizeOf = require('buffer-image-size')

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
  public backgroundTasks: Promise<void> = Promise.resolve()
  private eventListeners: { [key: string]: ((...args: any[]) => void)[] } = {}

  public constructor(public comic: Comic) {}

  public on(event: string, handler: () => void) {
    this.eventListeners[event] = this.eventListeners[event] || []
    this.eventListeners[event].push(handler)
  }

  public async previous() {
    const [previous, beforeThat] = await this.loadPages([this.currentIndex! - 1, this.currentIndex! - 2])

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

    this.current = await this.pagesForIndex(imageIndex)
    this.currentIndex = imageIndex
    this.cacheSurroundingPages()
    this.trigger('change', this.current)
  }

  private trigger(event: string, ...args: any[]) {
    const listeners = this.eventListeners[event] || []
    listeners.forEach(listener => listener(...args))
  }

  private async pagesForIndex(imageIndex: number) {
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

    return pages
  }

  private cacheSurroundingPages() {
    const lastIndex = this.comic.images.length - 1
    const minCachedIndex = Math.max(this.currentIndex! - 2, 0)
    const maxCachedIndex = Math.min(this.currentIndex! + 1 + this.current!.length, lastIndex)

    this.backgroundTasks = this.backgroundTasks.then(async () => {
      const pagesToRemove = this.cache
        .filter(page => page.imageIndex < minCachedIndex || page.imageIndex > maxCachedIndex)

      pagesToRemove.forEach(page => {
        this.cache = this.cache.filter(p => p.imageIndex !== page.imageIndex)
        this.trigger('cache:remove', page)
      })

      const loaders = []
      for (let i = minCachedIndex; i <= maxCachedIndex; i++)
        loaders.push(this.loadPage(i))

      await Promise.all(loaders)
    })
  }

  private async loadPages(indices: number[]) {
    return await Promise.all(indices
      .filter(index => index >= 0)
      .map(index => this.loadPage(index)))
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
      image: imageData
    }

    this.cache.push(page)
    this.trigger('cache:add', page)
    return page
  }
}
