import { ComicPage, Reader } from '@comix/parser'
import { useState, useEffect } from 'react'

export interface ComicPageWithUrl {
  index: number
  name: string
  type: string
  url: string
}

export const useComic = (reader: Reader | null) => {
  const [loading, setLoading] = useState(true)
  const [cachedPages, setCachedPages] = useState([] as ComicPageWithUrl[])
  const [visibleIndices, setVisibleIndices] = useState([] as number[])
  const [isFirstLoad, setIsFirstLoad] = useState(true)

  useEffect(() => {
    if (reader === null) return

    if (isFirstLoad) {
      setLoading(false)
      setIsFirstLoad(false)
      setVisibleIndices((reader.current || []).map(page => page.imageIndex))
      setCachedPages(cache => mergePagesWithCache(reader.cache, cache))
    }

    reader.on('change', async pages => {
      setVisibleIndices(pages.map(p => p.imageIndex))
      setCachedPages(cache => mergePagesWithCache(pages, cache))
    })

    reader.on('cache:add', page => {
      setCachedPages(cache => mergePagesWithCache([page], cache))
    })

    reader.on('cache:remove', page => {
      setCachedPages(cache => removePagesFromCache([page], cache))
    })

    return () => { reader.removeAllListeners() }
  }, [reader, isFirstLoad])

  const comic = reader?.comic
  const name = comic?.name
  const next = () => reader?.next()
  const previous = () => reader?.previous()
  const goto = (page: number) => reader?.goto(page)

  const currentPages = visibleIndices
    .map(index => cachedPages.find(p => p.index === index))
    .filter(page => page !== undefined) as ComicPageWithUrl[]

  const preloadedPages = cachedPages
    .filter(p => !visibleIndices.includes(p.index)) as ComicPageWithUrl[]

  return { loading, comic, name, currentPages, preloadedPages, next, previous, goto }
}

const pageToPageWithUrl = (page: ComicPage) => ({
  index: page.imageIndex,
  name: page.imageName,
  type: page.type,
  url: window.URL.createObjectURL(new Blob([page.image], { type: 'image/jpeg' }))
})

const mergePagesWithCache = (pages: ComicPage[], cache: ComicPageWithUrl[]) => {
  const newPages = pages.map(page => {
    const cached = cache.find(cachedPage => cachedPage.index === page.imageIndex)
    return cached || pageToPageWithUrl(page)
  })

  return [
    ...cache.filter(cachedPage => !newPages.some(np => np.index === cachedPage.index)),
    ...newPages
  ]
}

const removePagesFromCache = (pages: ComicPage[], cache: ComicPageWithUrl[]) => {
  const indicesToRemove = pages.map(page => page.imageIndex)
  return cache.filter(cachedPage => !indicesToRemove.includes(cachedPage.index))
}
